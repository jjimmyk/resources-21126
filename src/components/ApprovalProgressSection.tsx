import { Button } from './ui/button';

interface ApprovalProgressProps {
  resource: any;
  setSelectedApprovalRequest: (request: any) => void;
  setApproverName: (name: string) => void;
  setApproverPosition: (position: string) => void;
  setApprovalComments: (comments: string) => void;
  setIsViewMode: (mode: boolean) => void;
  setApprovalModalOpen: (open: boolean) => void;
  setReslTactical: (tactical: boolean) => void;
  setReslPersonnel: (personnel: boolean) => void;
  setReslResourceStatus: (status: string) => void;
  setLogisticsOrderNumber: (orderNumber: string) => void;
  setLogisticsEtaDate: (date: string) => void;
  setLogisticsEtaTime: (time: string) => void;
  setLogisticsTimeZone: (timezone: string) => void;
}

export function ApprovalProgressSection({
  resource,
  setSelectedApprovalRequest,
  setApproverName,
  setApproverPosition,
  setApprovalComments,
  setIsViewMode,
  setApprovalModalOpen,
  setReslTactical,
  setReslPersonnel,
  setReslResourceStatus,
  setLogisticsOrderNumber,
  setLogisticsEtaDate,
  setLogisticsEtaTime,
  setLogisticsTimeZone,
}: ApprovalProgressProps) {
  // Only show if there are resource requests with approval steps
  if (!resource.resourceRequests || resource.resourceRequests.length === 0 || !resource.resourceRequests[0].approvalSteps) {
    return null;
  }

  const firstRequest = resource.resourceRequests[0];

  return (
    <div className="pb-4 mb-4 border-b border-border">
      <div 
        className="text-foreground mb-4" 
        style={{ fontSize: 'var(--text-sm)' }}
      >
        Approval Progress
      </div>
      <div className="flex items-start gap-2">
        {/* Step 1: Request Resource */}
        <div className="flex-1">
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                firstRequest.approvalSteps.requestResource.status === 'completed'
                  ? 'bg-status-success border-status-success'
                  : firstRequest.approvalSteps.requestResource.status === 'rejected'
                  ? 'bg-status-error border-status-error'
                  : firstRequest.currentApprovalStep === 'requestResource'
                  ? 'bg-status-warning border-status-warning'
                  : 'bg-card border-border'
              }`}
            >
              {firstRequest.approvalSteps.requestResource.status === 'completed' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <span 
                  className={firstRequest.currentApprovalStep === 'requestResource' ? 'text-background' : 'text-muted-foreground'} 
                  style={{ fontSize: 'var(--text-xs)' }}
                >
                  1
                </span>
              )}
            </div>
            <div 
              className="text-center text-card-foreground" 
              style={{ fontSize: 'var(--text-xs)', maxWidth: '100px' }}
            >
              Request Resource
            </div>
            {firstRequest.approvalSteps.requestResource.status === 'completed' && (
              <div className="text-center text-foreground" style={{ fontSize: 'var(--text-xs)', maxWidth: '100px' }}>
                <div>RESL</div>
                {firstRequest.approvalSteps.requestResource.approver}
                {firstRequest.approvalSteps.requestResource.position && (
                  <div>{firstRequest.approvalSteps.requestResource.position}</div>
                )}
              </div>
            )}
            {/* Review button for Step 1 */}
            {firstRequest.status === 'pending-approval' && firstRequest.currentApprovalStep === 'requestResource' && (
              <div className="mt-2">
                {/* Button removed */}
              </div>
            )}
            {/* View button for Step 1 after approval */}
            {firstRequest.approvalSteps.requestResource.status === 'completed' && (
              <div className="mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedApprovalRequest({
                      resourceId: resource.id,
                      requestId: firstRequest.id,
                      requestName: resource.resource,
                      approverName: firstRequest.approvalSteps.requestResource.approver || '',
                      approverPosition: '',
                      currentStep: 'requestResource',
                      stepLabel: 'Request Resource',
                      approvalTimestamp: firstRequest.approvalSteps.requestResource.timestamp
                    });
                    setApproverName(firstRequest.approvalSteps.requestResource.approver || '');
                    setApproverPosition('');
                    setApprovalComments(firstRequest.approvalSteps.requestResource.comments || '');
                    setIsViewMode(true);
                    setApprovalModalOpen(true);
                  }}
                  className="border-border text-foreground hover:bg-muted h-7 px-2"
                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-xs)' }}
                >
                  View
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Connector Line */}
        <div className="flex-1 pt-4">
          <div 
            className={`h-0.5 ${
              firstRequest.approvalSteps.sectionChief.status === 'completed'
                ? 'bg-status-success'
                : 'bg-border'
            }`}
          />
        </div>

        {/* Step 2: Section Chief */}
        <div className="flex-1">
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                firstRequest.approvalSteps.sectionChief.status === 'completed'
                  ? 'bg-status-success border-status-success'
                  : firstRequest.approvalSteps.sectionChief.status === 'rejected'
                  ? 'bg-status-error border-status-error'
                  : firstRequest.currentApprovalStep === 'sectionChief'
                  ? 'bg-status-warning border-status-warning'
                  : 'bg-card border-border'
              }`}
            >
              {firstRequest.approvalSteps.sectionChief.status === 'completed' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <span 
                  className={firstRequest.currentApprovalStep === 'sectionChief' ? 'text-background' : 'text-muted-foreground'} 
                  style={{ fontSize: 'var(--text-xs)' }}
                >
                  2
                </span>
              )}
            </div>
            <div 
              className="text-center text-card-foreground" 
              style={{ fontSize: 'var(--text-xs)', maxWidth: '100px' }}
            >
              Section Chief
            </div>
            {firstRequest.approvalSteps.sectionChief.status === 'completed' && (
              <div className="text-center text-foreground" style={{ fontSize: 'var(--text-xs)', maxWidth: '100px' }}>
                {firstRequest.approvalSteps.sectionChief.approver || 'Cdr. Michael Chen'}
              </div>
            )}
            {/* Review button for Step 2 */}
            {firstRequest.status === 'pending-approval' && firstRequest.currentApprovalStep === 'sectionChief' && (
              <div className="mt-2">
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedApprovalRequest({
                      resourceId: resource.id,
                      requestId: firstRequest.id,
                      requestName: resource.resource,
                      approverName: '',
                      approverPosition: '',
                      currentStep: 'sectionChief',
                      stepLabel: 'Section Chief'
                    });
                    setApproverName('');
                    setApproverPosition('');
                    setApprovalComments('');
                    setIsViewMode(false);
                    setApprovalModalOpen(true);
                  }}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-7 px-2"
                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-xs)' }}
                >
                  Review
                </Button>
              </div>
            )}
            {/* View button for Step 2 after approval */}
            {firstRequest.approvalSteps.sectionChief.status === 'completed' && (
              <div className="mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedApprovalRequest({
                      resourceId: resource.id,
                      requestId: firstRequest.id,
                      requestName: resource.resource,
                      approverName: firstRequest.approvalSteps.sectionChief.approver || '',
                      approverPosition: '',
                      currentStep: 'sectionChief',
                      stepLabel: 'Section Chief',
                      approvalTimestamp: firstRequest.approvalSteps.sectionChief.timestamp
                    });
                    setApproverName(firstRequest.approvalSteps.sectionChief.approver || '');
                    setApproverPosition('');
                    setApprovalComments(firstRequest.approvalSteps.sectionChief.comments || '');
                    setIsViewMode(true);
                    setApprovalModalOpen(true);
                  }}
                  className="border-border text-foreground hover:bg-muted h-7 px-2"
                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-xs)' }}
                >
                  View
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Connector Line */}
        <div className="flex-1 pt-4">
          <div 
            className={`h-0.5 ${
              firstRequest.approvalSteps.reslReview.status === 'completed'
                ? 'bg-status-success'
                : 'bg-border'
            }`}
          />
        </div>

        {/* Step 3: RESL Review */}
        <div className="flex-1">
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                firstRequest.approvalSteps.reslReview.status === 'completed'
                  ? 'bg-status-success border-status-success'
                  : firstRequest.approvalSteps.reslReview.status === 'rejected'
                  ? 'bg-status-error border-status-error'
                  : firstRequest.currentApprovalStep === 'reslReview'
                  ? 'bg-status-warning border-status-warning'
                  : 'bg-card border-border'
              }`}
            >
              {firstRequest.approvalSteps.reslReview.status === 'completed' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <span 
                  className={firstRequest.currentApprovalStep === 'reslReview' ? 'text-background' : 'text-muted-foreground'} 
                  style={{ fontSize: 'var(--text-xs)' }}
                >
                  3
                </span>
              )}
            </div>
            <div 
              className="text-center text-card-foreground" 
              style={{ fontSize: 'var(--text-xs)', maxWidth: '100px' }}
            >
              RESL Review
            </div>
            {firstRequest.approvalSteps.reslReview.status === 'completed' && (
              <div className="text-center text-muted-foreground caption" style={{ fontSize: 'var(--text-xs)', maxWidth: '100px' }}>
                {firstRequest.approvalSteps.reslReview.approver}
              </div>
            )}
            {/* Review button for Step 3 */}
            {firstRequest.status === 'pending-approval' && firstRequest.currentApprovalStep === 'reslReview' && (
              <div className="mt-2">
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedApprovalRequest({
                      resourceId: resource.id,
                      requestId: firstRequest.id,
                      requestName: resource.resource,
                      approverName: '',
                      approverPosition: '',
                      currentStep: 'reslReview',
                      stepLabel: 'RESL Review'
                    });
                    setApproverName('');
                    setApproverPosition('');
                    setApprovalComments('');
                    setReslTactical(false);
                    setReslPersonnel(false);
                    setReslResourceStatus('available');
                    setIsViewMode(false);
                    setApprovalModalOpen(true);
                  }}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-7 px-2"
                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-xs)' }}
                >
                  Sign Approval
                </Button>
              </div>
            )}
            {/* View button for Step 3 after approval */}
            {firstRequest.approvalSteps.reslReview.status === 'completed' && (
              <div className="mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedApprovalRequest({
                      resourceId: resource.id,
                      requestId: firstRequest.id,
                      requestName: resource.resource,
                      approverName: firstRequest.approvalSteps.reslReview.approver || '',
                      approverPosition: '',
                      currentStep: 'reslReview',
                      stepLabel: 'RESL Review',
                      approvalTimestamp: firstRequest.approvalSteps.reslReview.timestamp
                    });
                    setApproverName(firstRequest.approvalSteps.reslReview.approver || '');
                    setApproverPosition('');
                    setApprovalComments(firstRequest.approvalSteps.reslReview.comments || '');
                    if (firstRequest.approvalSteps.reslReview.data) {
                      setReslTactical(firstRequest.approvalSteps.reslReview.data.tactical || false);
                      setReslPersonnel(firstRequest.approvalSteps.reslReview.data.personnel || false);
                      setReslResourceStatus(firstRequest.approvalSteps.reslReview.data.resourceStatus || 'available');
                    }
                    setIsViewMode(true);
                    setApprovalModalOpen(true);
                  }}
                  className="border-border text-foreground hover:bg-muted h-7 px-2"
                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-xs)' }}
                >
                  View
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Connector Line */}
        <div className="flex-1 pt-4">
          <div 
            className={`h-0.5 ${
              firstRequest.approvalSteps.logistics.status === 'completed'
                ? 'bg-status-success'
                : 'bg-border'
            }`}
          />
        </div>

        {/* Step 4: Logistics */}
        <div className="flex-1">
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                firstRequest.approvalSteps.logistics.status === 'completed'
                  ? 'bg-status-success border-status-success'
                  : firstRequest.approvalSteps.logistics.status === 'rejected'
                  ? 'bg-status-error border-status-error'
                  : firstRequest.currentApprovalStep === 'logistics'
                  ? 'bg-status-warning border-status-warning'
                  : 'bg-card border-border'
              }`}
            >
              {firstRequest.approvalSteps.logistics.status === 'completed' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <span 
                  className={firstRequest.currentApprovalStep === 'logistics' ? 'text-background' : 'text-muted-foreground'} 
                  style={{ fontSize: 'var(--text-xs)' }}
                >
                  4
                </span>
              )}
            </div>
            <div 
              className="text-center text-card-foreground" 
              style={{ fontSize: 'var(--text-xs)', maxWidth: '100px' }}
            >
              Logistics
            </div>
            {firstRequest.approvalSteps.logistics.status === 'completed' && (
              <div className="text-center text-muted-foreground caption" style={{ fontSize: 'var(--text-xs)', maxWidth: '100px' }}>
                {firstRequest.approvalSteps.logistics.approver}
              </div>
            )}
            {/* Review button for Step 4 */}
            {firstRequest.status === 'pending-approval' && firstRequest.currentApprovalStep === 'logistics' && (
              <div className="mt-2">
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedApprovalRequest({
                      resourceId: resource.id,
                      requestId: firstRequest.id,
                      requestName: resource.resource,
                      approverName: '',
                      approverPosition: '',
                      currentStep: 'logistics',
                      stepLabel: 'Logistics'
                    });
                    setApproverName('');
                    setApproverPosition('');
                    setApprovalComments('');
                    setLogisticsOrderNumber('');
                    setLogisticsEtaDate('');
                    setLogisticsEtaTime('');
                    setLogisticsTimeZone('UTC');
                    setIsViewMode(false);
                    setApprovalModalOpen(true);
                  }}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-7 px-2"
                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-xs)' }}
                >
                  Sign Approval
                </Button>
              </div>
            )}
            {/* View button for Step 4 after approval */}
            {firstRequest.approvalSteps.logistics.status === 'completed' && (
              <div className="mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedApprovalRequest({
                      resourceId: resource.id,
                      requestId: firstRequest.id,
                      requestName: resource.resource,
                      approverName: firstRequest.approvalSteps.logistics.approver || '',
                      approverPosition: '',
                      currentStep: 'logistics',
                      stepLabel: 'Logistics',
                      approvalTimestamp: firstRequest.approvalSteps.logistics.timestamp
                    });
                    setApproverName(firstRequest.approvalSteps.logistics.approver || '');
                    setApproverPosition('');
                    setApprovalComments(firstRequest.approvalSteps.logistics.comments || '');
                    if (firstRequest.approvalSteps.logistics.data) {
                      setLogisticsOrderNumber(firstRequest.approvalSteps.logistics.data.orderNumber || '');
                      const etaData = firstRequest.approvalSteps.logistics.data.eta;
                      if (etaData) {
                        setLogisticsEtaDate(etaData.date || '');
                        setLogisticsEtaTime(etaData.time || '');
                        setLogisticsTimeZone(etaData.timezone || 'UTC');
                      }
                    }
                    setIsViewMode(true);
                    setApprovalModalOpen(true);
                  }}
                  className="border-border text-foreground hover:bg-muted h-7 px-2"
                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-xs)' }}
                >
                  View
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Connector Line */}
        <div className="flex-1 pt-4">
          <div 
            className={`h-0.5 ${
              firstRequest.approvalSteps.finance.status === 'completed'
                ? 'bg-status-success'
                : 'bg-border'
            }`}
          />
        </div>

        {/* Step 5: Finance */}
        <div className="flex-1">
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                firstRequest.approvalSteps.finance.status === 'completed'
                  ? 'bg-status-success border-status-success'
                  : firstRequest.approvalSteps.finance.status === 'rejected'
                  ? 'bg-status-error border-status-error'
                  : firstRequest.currentApprovalStep === 'finance'
                  ? 'bg-status-warning border-status-warning'
                  : 'bg-card border-border'
              }`}
            >
              {firstRequest.approvalSteps.finance.status === 'completed' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <span 
                  className={firstRequest.currentApprovalStep === 'finance' ? 'text-background' : 'text-muted-foreground'} 
                  style={{ fontSize: 'var(--text-xs)' }}
                >
                  5
                </span>
              )}
            </div>
            <div 
              className="text-center text-card-foreground" 
              style={{ fontSize: 'var(--text-xs)', maxWidth: '100px' }}
            >
              Finance
            </div>
            {firstRequest.approvalSteps.finance.status === 'completed' && (
              <div className="text-center text-muted-foreground caption" style={{ fontSize: 'var(--text-xs)', maxWidth: '100px' }}>
                {firstRequest.approvalSteps.finance.approver}
              </div>
            )}
            {/* Review button for Step 5 */}
            {firstRequest.status === 'pending-approval' && firstRequest.currentApprovalStep === 'finance' && (
              <div className="mt-2">
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedApprovalRequest({
                      resourceId: resource.id,
                      requestId: firstRequest.id,
                      requestName: resource.resource,
                      approverName: '',
                      approverPosition: '',
                      currentStep: 'finance',
                      stepLabel: 'Finance'
                    });
                    setApproverName('');
                    setApproverPosition('');
                    setApprovalComments('');
                    setIsViewMode(false);
                    setApprovalModalOpen(true);
                  }}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-7 px-2"
                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-xs)' }}
                >
                  Sign Approval
                </Button>
              </div>
            )}
            {/* View button for Step 5 after approval */}
            {firstRequest.approvalSteps.finance.status === 'completed' && (
              <div className="mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedApprovalRequest({
                      resourceId: resource.id,
                      requestId: firstRequest.id,
                      requestName: resource.resource,
                      approverName: firstRequest.approvalSteps.finance.approver || '',
                      approverPosition: '',
                      currentStep: 'finance',
                      stepLabel: 'Finance',
                      approvalTimestamp: firstRequest.approvalSteps.finance.timestamp
                    });
                    setApproverName(firstRequest.approvalSteps.finance.approver || '');
                    setApproverPosition('');
                    setApprovalComments(firstRequest.approvalSteps.finance.comments || '');
                    setIsViewMode(true);
                    setApprovalModalOpen(true);
                  }}
                  className="border-border text-foreground hover:bg-muted h-7 px-2"
                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-xs)' }}
                >
                  View
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}