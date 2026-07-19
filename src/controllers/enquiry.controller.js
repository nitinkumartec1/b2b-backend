import logger from '../utils/logger.js';
import Enquiry from '../models/Enquiry.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendEmail } from '../utils/sendEmail.js';

// POST /api/enquiries
export const createEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.create(req.body);

  // Send email to admin
  if (process.env.ENQUIRY_EMAIL) {
    try {
      await sendEmail({
        email: process.env.ENQUIRY_EMAIL,
        subject: `New Travel Enquiry - ${enquiry.packageName}`,
        html: `
          <h3>New Travel Enquiry Received</h3>
          <p><strong>Package:</strong> ${enquiry.packageName || enquiry.destination}</p>
          <p><strong>Name:</strong> ${enquiry.name}</p>
          <p><strong>Email:</strong> ${enquiry.email}</p>
          <p><strong>Phone:</strong> ${enquiry.phone}</p>
          <p><strong>Travel Date:</strong> ${enquiry.travelDate}</p>
          <p><strong>Travelers:</strong> ${enquiry.travelers}</p>
          <p><strong>Special Requirements:</strong> ${enquiry.specialRequirements || 'None'}</p>
        `
      });
    } catch (error) {
      logger.error('Failed to send enquiry email:', error);
      // We don't fail the request if the email fails
    }
  }

  res.status(201).json({ 
    success: true, 
    enquiry, 
    message: 'Enquiry submitted successfully' 
  });
});

// GET /api/enquiries (Admin only)
export const getEnquiries = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (search) {
    filter.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { phone: new RegExp(search, 'i') },
      { packageName: new RegExp(search, 'i') }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    Enquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Enquiry.countDocuments(filter)
  ]);

  res.json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    count: items.length,
    items
  });
});

// PATCH /api/enquiries/:id/status (Admin only)
export const updateEnquiryStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['New', 'Contacted', 'Confirmed', 'Closed'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  const enquiry = await Enquiry.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!enquiry) {
    return res.status(404).json({ success: false, message: 'Enquiry not found' });
  }

  res.json({ success: true, enquiry });
});
