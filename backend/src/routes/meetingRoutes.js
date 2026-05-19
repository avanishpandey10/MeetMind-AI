import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import Meeting from '../models/Meeting.js';
import llmService from '../services/llmService.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Process new meeting transcript
router.post('/process', async (req, res, next) => {
  try {
    const { transcript, title } = req.body;
    
    if (!transcript || transcript.trim().length < 50) {
      return res.status(400).json({ error: 'Transcript too short. Minimum 50 characters required.' });
    }

    // Process with LLM
    const analysis = await llmService.processMeeting(transcript);
    
    // Create meeting record
    const meeting = new Meeting({
      title: title || 'Untitled Meeting',
      transcript,
      summary: analysis.summary,
      actionItems: analysis.action_items,
      decisions: analysis.decisions,
      metadata: {
        wordCount: transcript.split(/\s+/).length,
        processedAt: new Date()
      }
    });

    await meeting.save(); 
    
    res.json(meeting);
  } catch (error) {
    next(error);
  }
});

// Upload and process file
router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const transcript = req.file.buffer.toString('utf-8');
    const title = req.body.title || req.file.originalname.replace(/\.[^/.]+$/, "");
    
    // Create request body and forward to process
    req.body = { transcript, title };
    return router.handle(req, res, next);
  } catch (error) {
    next(error);
  }
});

// Generate follow-up email
router.post('/:id/followup-email', async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const email = await llmService.generateFollowUpEmail(
      meeting.summary,
      meeting.actionItems,
      meeting.decisions
    );

    meeting.followUpEmail = email;
    await meeting.save();

    res.json({ email });
  } catch (error) {
    next(error);
  }
});

// Chat with meeting
router.post('/:id/chat', async (req, res, next) => {
  try {
    const { question } = req.body;
    const meeting = await Meeting.findById(req.params.id);
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const answer = await llmService.chatWithMeeting(meeting.transcript, question);
    res.json({ question, answer });
  } catch (error) {
    next(error);
  }
});

// Get all meetings
router.get('/', async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    let query = {};
    
    if (search) {
      query = { $text: { $search: search } };
    }

    const meetings = await Meeting.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-transcript'); // Exclude full transcript for list view

    const total = await Meeting.countDocuments(query);

    res.json({
      meetings,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get single meeting
router.get('/:id', async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    res.json(meeting);
  } catch (error) {
    next(error);
  }
});

// Update action item status
router.patch('/:id/action-items/:itemId', async (req, res, next) => {
  try {
    const { status } = req.body;
    const meeting = await Meeting.findById(req.params.id);
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const actionItem = meeting.actionItems.id(req.params.itemId);
    if (!actionItem) {
      return res.status(404).json({ error: 'Action item not found' });
    }

    actionItem.status = status;
    await meeting.save();

    res.json(meeting);
  } catch (error) {
    next(error);
  }
});

// Export meeting as markdown
router.get('/:id/export', async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const markdown = generateMarkdown(meeting);
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="meeting-${meeting._id}.md"`);
    res.send(markdown);
  } catch (error) {
    next(error);
  }
});

function generateMarkdown(meeting) {
  return `# ${meeting.title}

**Date:** ${new Date(meeting.createdAt).toLocaleDateString()}

## Summary
${meeting.summary}

## Action Items
${meeting.actionItems.map(item => 
  `- [${item.status === 'completed' ? 'x' : ' '}] **${item.description}** - ${item.assignee}${item.deadline ? ` (Due: ${item.deadline})` : ''}`
).join('\n')}

## Decisions Made
${meeting.decisions.map(decision => `- ${decision}`).join('\n')}

${meeting.followUpEmail ? `## Follow-up Email\n${meeting.followUpEmail}` : ''}

---
*Processed by AI Meeting Assistant*
`;
}

export default router;
