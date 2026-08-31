import React, { useState } from 'react';
import { UserComplaint, UserProfile } from '../types';
import { 
  X, 
  AlertCircle, 
  CheckCircle2, 
  MessageSquareWarning, 
  Send, 
  Clock, 
  ShieldAlert, 
  FileText, 
  Phone, 
  User, 
  Tag, 
  Sparkles,
  Search,
  ExternalLink
} from 'lucide-react';

interface ComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile;
  initialOrderId?: string;
  onRegisterComplaint: (complaint: UserComplaint) => void;
  complaintsList: UserComplaint[];
}

export const ComplaintModal: React.FC<ComplaintModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  initialOrderId = '',
  onRegisterComplaint,
  complaintsList,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'new' | 'track'>('new');
  const [name, setName] = useState(currentUser?.name || '');
  const [contact, setContact] = useState(currentUser?.phone || currentUser?.email || '');
  const [category, setCategory] = useState<UserComplaint['issueCategory']>('Payment & Escrow');
  const [orderId, setOrderId] = useState(initialOrderId);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<UserComplaint['priority']>('Medium');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState<UserComplaint | null>(null);
  const [searchTicketQuery, setSearchTicketQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    const ticketNumber = `GRV-AGRI-${Math.floor(100000 + Math.random() * 900000)}`;
    const newComplaint: UserComplaint = {
      id: `complaint-${Date.now()}`,
      ticketNumber,
      userName: name.trim() || 'Anonymous User',
      userContact: contact.trim() || 'No contact provided',
      issueCategory: category,
      orderId: orderId.trim() || undefined,
      subject: subject.trim(),
      description: description.trim(),
      priority,
      status: 'Registered',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    onRegisterComplaint(newComplaint);
    setGeneratedTicket(newComplaint);
    setIsSubmitted(true);
  };

  const handleResetForm = () => {
    setIsSubmitted(false);
    setGeneratedTicket(null);
    setSubject('');
    setDescription('');
    setOrderId('');
  };

  const filteredComplaints = complaintsList.filter(
    (c) =>
      c.ticketNumber.toLowerCase().includes(searchTicketQuery.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchTicketQuery.toLowerCase()) ||
      c.issueCategory.toLowerCase().includes(searchTicketQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-[#FAF9F6] rounded-2xl shadow-2xl border border-[#E8E5DF] overflow-hidden my-4 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#233B2B] text-[#FAF9F6] p-4 sm:p-5 relative border-b border-[#3A5741] shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#D0C8BB] hover:text-[#FAF9F6] p-1.5 rounded-full hover:bg-[#1A2E21] transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-amber-200 text-xs font-semibold uppercase tracking-wider mb-1 font-serif">
            <ShieldAlert className="w-4 h-4 text-amber-300" />
            <span>Agritech Bharat Grievance & Dispute Redressal</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-[#FAF9F6]">
                Kisan & Buyer Grievance Portal
              </h2>
              <p className="text-[#D0C8BB] text-xs mt-0.5">
                Register complaints regarding mandi lots, payments, logistics, or weighbridge disputes.
              </p>
            </div>

            {/* Tab switch */}
            <div className="flex items-center gap-1 bg-[#1A2E21] border border-[#3A5741] p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => { setActiveTab('new'); setIsSubmitted(false); }}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  activeTab === 'new'
                    ? 'bg-amber-300 text-[#233B2B] font-bold'
                    : 'text-[#D0C8BB] hover:text-white'
                }`}
              >
                File Complaint
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('track')}
                className={`px-3 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  activeTab === 'track'
                    ? 'bg-amber-300 text-[#233B2B] font-bold'
                    : 'text-[#D0C8BB] hover:text-white'
                }`}
              >
                <span>Track Tickets</span>
                <span className="bg-[#2D4F38] text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                  {complaintsList.length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white">
          {activeTab === 'new' ? (
            isSubmitted && generatedTicket ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 bg-[#EBF3ED] text-[#2D4F38] rounded-full flex items-center justify-center mx-auto border border-[#C6DFC9]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#2D4F38] bg-[#EBF3ED] px-2.5 py-0.5 rounded-md border border-[#C6DFC9]">
                      Grievance Registered Successfully
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Synced to Firestore
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-xl text-[#1C1C1C] pt-2">
                    Ticket Reference #{generatedTicket.ticketNumber}
                  </h3>
                  <p className="text-xs text-[#5C554B] max-w-md mx-auto">
                    Your complaint has been logged and securely recorded in Firebase Firestore under the Agritech Bharat dispute resolution desk. Our procurement arbitration team will review within 24 business hours.
                  </p>
                </div>

                {/* Ticket Details Summary */}
                <div className="bg-[#FAF9F6] border border-[#E8E5DF] rounded-2xl p-4 text-left max-w-lg mx-auto space-y-2 text-xs">
                  <div className="flex justify-between border-b border-[#E8E5DF] pb-2">
                    <span className="text-[#7A746B]">Category:</span>
                    <strong className="text-[#1C1C1C]">{generatedTicket.issueCategory}</strong>
                  </div>
                  <div className="flex justify-between border-b border-[#E8E5DF] pb-2">
                    <span className="text-[#7A746B]">Subject:</span>
                    <strong className="text-[#1C1C1C]">{generatedTicket.subject}</strong>
                  </div>
                  <div className="flex justify-between border-b border-[#E8E5DF] pb-2">
                    <span className="text-[#7A746B]">Priority:</span>
                    <span className="font-semibold text-[#C2593F]">{generatedTicket.priority} Priority</span>
                  </div>
                  {generatedTicket.orderId && (
                    <div className="flex justify-between border-b border-[#E8E5DF] pb-2">
                      <span className="text-[#7A746B]">Order Ref:</span>
                      <strong className="font-mono text-[#2D4F38]">{generatedTicket.orderId}</strong>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[#7A746B]">Status:</span>
                    <span className="bg-amber-100 text-amber-900 border border-amber-300 font-semibold px-2 py-0.5 rounded text-[10px]">
                      {generatedTicket.status}
                    </span>
                  </div>
                </div>

                <div className="flex justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="py-2 px-4 bg-[#FAF9F6] hover:bg-[#EAE4D8] border border-[#D5CCBD] text-xs font-semibold rounded-xl text-[#3D3830] transition"
                  >
                    File Another Complaint
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('track')}
                    className="py-2 px-4 bg-[#2D4F38] hover:bg-[#1E3727] text-white text-xs font-semibold rounded-xl transition"
                  >
                    View All My Tickets
                  </button>
                </div>
              </div>
            ) : (
              /* Complaint Filing Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-[#FAF9F6] border border-[#E8E5DF] p-3 rounded-xl flex items-start gap-2.5 text-xs text-[#5C554B]">
                  <AlertCircle className="w-4 h-4 text-[#2D4F38] shrink-0 mt-0.5" />
                  <p>
                    Please provide full details about your dispute, order mismatch, or technical issue. We ensure prompt resolution through official APMC & e-NAM trade standards.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1C1C] mb-1">
                      Your Name / Enterprise Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#7A746B] absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar / ITC Procurement"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF9F6] border border-[#D5CCBD] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1C1C1C] mb-1">
                      Phone Number / Email ID <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#7A746B] absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="e.g. +91 98765 43210 or email@domain.com"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF9F6] border border-[#D5CCBD] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1C1C] mb-1">
                      Issue Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#D5CCBD] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                    >
                      <option value="Payment & Escrow">Payment & Escrow Lock</option>
                      <option value="Quality Discrepancy">Quality & Moisture Discrepancy</option>
                      <option value="Delivery & Logistics">Delivery Delay & Logistics</option>
                      <option value="Weighbridge & Quantity">Weighbridge Tare Mismatch</option>
                      <option value="Account & KYC">Account, GST & KYC</option>
                      <option value="Other">Other Query / Technical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1C1C1C] mb-1">
                      Order / Transaction ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="e.g. TXN-IN-884210"
                      className="w-full px-3 py-2 text-xs font-mono bg-[#FAF9F6] border border-[#D5CCBD] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1C1C1C] mb-1">
                      Urgency Level
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#D5CCBD] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#2D4F38] focus:outline-none font-semibold text-[#1C1C1C]"
                    >
                      <option value="Low">Low - General Query</option>
                      <option value="Medium">Medium - Standard Issue (24h)</option>
                      <option value="High">High - Trade / Payment Block (6h)</option>
                      <option value="Urgent">Urgent - In-Transit / Mandi Gate Halt</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1C1C] mb-1">
                    Subject / Short Issue Summary <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Moisture test on lot #LST-101 exceeds agreed APMC specification"
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#D5CCBD] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1C1C] mb-1">
                    Detailed Complaint Description & Evidence Notes <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what happened, dates, truck numbers, weighbridge readings, or communication history with farmer/buyer..."
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#D5CCBD] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="py-2 px-4 bg-[#FAF9F6] hover:bg-[#EFEBE3] text-[#5C554B] border border-[#D5CCBD] font-semibold rounded-xl text-xs transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="py-2.5 px-5 bg-[#2D4F38] hover:bg-[#1E3727] text-white font-semibold rounded-xl text-xs transition flex items-center gap-2 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-200" />
                    <span>Submit Grievance Ticket</span>
                  </button>
                </div>
              </form>
            )
          ) : (
            /* Track Tickets List */
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#7A746B] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchTicketQuery}
                    onChange={(e) => setSearchTicketQuery(e.target.value)}
                    placeholder="Search by ticket #, category, or keyword..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF9F6] border border-[#D5CCBD] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#2D4F38] focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => { setActiveTab('new'); handleResetForm(); }}
                  className="py-2 px-3 bg-[#2D4F38] text-white text-xs font-semibold rounded-xl hover:bg-[#1E3727] transition shrink-0"
                >
                  + New Ticket
                </button>
              </div>

              {filteredComplaints.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-[#D5CCBD] rounded-2xl bg-[#FAF9F6] p-6 space-y-2">
                  <MessageSquareWarning className="w-8 h-8 text-[#7A746B] mx-auto opacity-60" />
                  <h4 className="font-serif font-bold text-sm text-[#1C1C1C]">No Complaints Found</h4>
                  <p className="text-xs text-[#7A746B]">
                    {searchTicketQuery ? 'No tickets matched your query.' : 'You have not registered any grievance tickets yet.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredComplaints.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#FAF9F6] border border-[#E8E5DF] rounded-xl p-4 space-y-2.5 hover:border-[#D5CCBD] transition"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-[#2D4F38]">
                              #{item.ticketNumber}
                            </span>
                            <span className="text-[10px] bg-white border border-[#D5CCBD] text-[#3D3830] px-2 py-0.5 rounded font-medium">
                              {item.issueCategory}
                            </span>
                            {item.orderId && (
                              <span className="text-[10px] text-[#7A746B] font-mono">
                                Order: {item.orderId}
                              </span>
                            )}
                          </div>
                          <h4 className="font-serif font-bold text-sm text-[#1C1C1C] mt-1">
                            {item.subject}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                              item.status === 'Resolved'
                                ? 'bg-[#EBF3ED] text-[#2D4F38] border border-[#C6DFC9]'
                                : item.status === 'Under Investigation'
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-[#5C554B] line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-[#7A746B] pt-2 border-t border-[#E8E5DF]/70">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Filed: {item.createdAt}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>Contact: <strong>{item.userName}</strong> ({item.userContact})</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
