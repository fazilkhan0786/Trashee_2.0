import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

/**
 * Examples showing how to use the updated Dialog component
 * to avoid duplicate close buttons
 */

export default function DialogExamples() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showSimpleDialog, setShowSimpleDialog] = useState(false);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-6">Dialog Examples - No Duplicate Close Buttons</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Example 1: Confirmation Dialog with Footer Buttons */}
        <Button onClick={() => setShowConfirmDialog(true)}>
          Confirmation Dialog (Footer Buttons Only)
        </Button>

        {/* Example 2: Info Dialog with X Button Only */}
        <Button onClick={() => setShowInfoDialog(true)}>
          Info Dialog (X Button Only)
        </Button>

        {/* Example 3: Form Dialog with Both */}
        <Button onClick={() => setShowFormDialog(true)}>
          Form Dialog (Both X and Footer)
        </Button>

        {/* Example 4: Simple Dialog (Auto-close) */}
        <Button onClick={() => setShowSimpleDialog(true)}>
          Simple Dialog (Auto-close)
        </Button>
      </div>

      {/* Example 1: Confirmation Dialog - Footer buttons only, no X button */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Confirm Action
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                // Perform action
                setShowConfirmDialog(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Example 2: Info Dialog - X button only, no footer */}
      <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <DialogContent showCloseButton={true}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" />
              Information
            </DialogTitle>
            <DialogDescription>
              This is an informational dialog. You can close it using the X button in the top-right corner.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Badge variant="secondary">
              Only X button for closing
            </Badge>
          </div>
        </DialogContent>
      </Dialog>

      {/* Example 3: Form Dialog - Both X button and footer buttons */}
      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent showCloseButton={true}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Edit Profile
            </DialogTitle>
            <DialogDescription>
              Make changes to your profile. You can close with X or use the buttons below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded-md" 
                placeholder="Enter your name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input 
                type="email" 
                className="w-full p-2 border rounded-md" 
                placeholder="Enter your email"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowFormDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setShowFormDialog(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Example 4: Simple Dialog - No explicit close buttons (relies on overlay click) */}
      <Dialog open={showSimpleDialog} onOpenChange={setShowSimpleDialog}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Success!</DialogTitle>
            <DialogDescription>
              Your action was completed successfully. Click outside to close.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <Badge variant="default" className="bg-green-100 text-green-800">
              Auto-closes on overlay click
            </Badge>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * USAGE PATTERNS:
 * 
 * 1. CONFIRMATION DIALOGS:
 *    - Use showCloseButton={false}
 *    - Provide Cancel/Confirm buttons in footer
 *    - Forces user to make explicit choice
 * 
 * 2. INFORMATION DIALOGS:
 *    - Use showCloseButton={true}
 *    - No footer buttons needed
 *    - Quick dismissal with X button
 * 
 * 3. FORM DIALOGS:
 *    - Use showCloseButton={true}
 *    - Provide Cancel/Save buttons in footer
 *    - Multiple ways to close for flexibility
 * 
 * 4. SIMPLE NOTIFICATIONS:
 *    - Use showCloseButton={false}
 *    - No footer buttons
 *    - Relies on overlay click to close
 */
