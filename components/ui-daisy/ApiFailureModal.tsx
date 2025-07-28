'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExclamationTriangleIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';

interface ApiFailureModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  feature?: string;
}

export const ApiFailureModal: React.FC<ApiFailureModalProps> = ({
  isOpen,
  onClose,
  title = "We're experiencing technical difficulties",
  feature = "this feature"
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-base-100/95 backdrop-blur-sm border border-base-300/50 rounded-xl shadow-2xl max-w-md w-full p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-warning/20 rounded-full flex items-center justify-center">
                    <ExclamationTriangleIcon className="w-6 h-6 text-warning" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-base-content">
                    {title}
                  </h3>
                  <p className="text-sm text-base-content/70">
                    Temporary service issue
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-base-content/80 mb-4">
                  We apologize for the inconvenience. Our AI service is currently experiencing some technical issues that prevented {feature} from working properly.
                </p>
                
                <div className="bg-base-200/50 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <WrenchScrewdriverIcon className="w-5 h-5 text-info mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-base-content mb-1">What we're doing:</h4>
                      <ul className="text-sm text-base-content/70 space-y-1">
                        <li>• Our team has been automatically notified</li>
                        <li>• We're working on a fix right now</li>
                        <li>• Service should be restored shortly</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-base-content/60">
                  You can try again in a few minutes, or come back later. Thank you for your patience!
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="btn btn-primary flex-1"
                  data-testid="api-failure-modal-close-button"
                >
                  I understand
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="btn btn-outline"
                  data-testid="api-failure-modal-refresh-button"
                >
                  Refresh page
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};