import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Share2, Mail, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SectionShareDialogProps {
  sectionName: string;
  sectionData: any;
  vendorName: string;
  vendorId: string;
}

const SectionShareDialog: React.FC<SectionShareDialogProps> = ({
  sectionName,
  sectionData,
  vendorName,
  vendorId
}) => {
  const [open, setOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipientEmail) {
      toast.error('Please enter recipient email');
      return;
    }

    setIsSharing(true);
    
    try {
      const { error } = await supabase.functions.invoke('send-confirmation-email', {
        body: {
          email: recipientEmail,
          vendorName,
          vendorId,
          type: 'share_section',
          sharedSection: sectionName,
          sharedData: sectionData,
          recipientEmail
        }
      });

      if (error) {
        console.error('Error sharing section:', error);
        toast.error('Failed to share section information');
        return;
      }

      // Log the sharing activity
      await supabase
        .from('audit_logs')
        .insert({
          action: 'section_shared',
          entity_type: 'vendor_profile',
          entity_id: vendorId,
          vendor_id: vendorId,
          new_values: {
            section: sectionName,
            recipient_email: recipientEmail,
            message: message,
            timestamp: new Date().toISOString()
          }
        });

      toast.success(`${sectionName} information shared successfully!`);
      setOpen(false);
      setRecipientEmail('');
      setMessage('');

    } catch (error) {
      console.error('Error sharing section:', error);
      toast.error('Failed to share section information');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Share {sectionName}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share {sectionName} Information</DialogTitle>
          <DialogDescription>
            Share your {sectionName.toLowerCase()} information with a colleague or partner via email.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleShare} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient-email">Recipient Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="recipient-email"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="Enter recipient's email address"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message..."
              rows={3}
            />
          </div>

          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600">
              <strong>What will be shared:</strong> Your {sectionName.toLowerCase()} information including relevant data and documents will be sent to the recipient.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isSharing}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSharing}
              className="flex items-center gap-2"
            >
              {isSharing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sharing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Share Information
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SectionShareDialog;