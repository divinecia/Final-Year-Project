import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  getJobStatusOptions, 
  getPaymentStatusOptions, 
  getPayFrequencyOptions, 
  getUserRoleOptions 
} from '@/lib/system-config';

// Status Badge Component
interface StatusBadgeProps {
  statusId: string;
  type: 'job' | 'payment' | 'user';
  className?: string;
}

export function StatusBadge({ statusId, type, className = "" }: StatusBadgeProps) {
  const [statusData, setStatusData] = React.useState<{ label: string; color: string } | null>(null);

  React.useEffect(() => {
    async function loadStatus() {
      try {
        let options: Array<{ id: string; label: string; color: string }> = [];
        
        switch (type) {
          case 'job':
            options = await getJobStatusOptions();
            break;
          case 'payment':
            options = await getPaymentStatusOptions();
            break;
          case 'user':
            // For user roles, we might not have colors, so we'll provide defaults
            const userRoles = await getUserRoleOptions();
            options = userRoles.map(role => ({
              id: role.id,
              label: role.label,
              color: role.id === 'admin' ? 'purple' : role.id === 'worker' ? 'green' : 'blue'
            }));
            break;
        }
        
        const status = options.find(opt => opt.id === statusId);
        if (status) {
          setStatusData(status);
        }
      } catch (error) {
        console.error('Error loading status:', error);
        // Fallback display
        setStatusData({ label: statusId, color: 'gray' });
      }
    }

    loadStatus();
  }, [statusId, type]);

  if (!statusData) {
    return <Badge variant="secondary" className={className}>Loading...</Badge>;
  }

  // Map colors to badge variants and styles
  const getVariantAndClass = (color: string) => {
    switch (color) {
      case 'green':
        return { variant: 'default' as const, className: 'bg-green-100 text-green-800 border-green-200' };
      case 'yellow':
        return { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 'red':
        return { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 border-red-200' };
      case 'blue':
        return { variant: 'secondary' as const, className: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'orange':
        return { variant: 'default' as const, className: 'bg-orange-100 text-orange-800 border-orange-200' };
      case 'purple':
        return { variant: 'default' as const, className: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'gray':
        return { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800 border-gray-200' };
      default:
        return { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const { variant, className: colorClass } = getVariantAndClass(statusData.color);

  return (
    <Badge variant={variant} className={`${colorClass} ${className}`}>
      {statusData.label}
    </Badge>
  );
}

// Status Select Component
interface StatusSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  type: 'job' | 'payment' | 'payFrequency' | 'userRole';
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function StatusSelect({ 
  value, 
  onValueChange, 
  type, 
  placeholder = "Select status...",
  disabled = false,
  className = ""
}: StatusSelectProps) {
  const [options, setOptions] = React.useState<Array<{ id: string; label: string; description?: string }>>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadOptions() {
      try {
        setIsLoading(true);
        let optionsData: Array<{ id: string; label: string; description?: string }> = [];
        
        switch (type) {
          case 'job':
            optionsData = await getJobStatusOptions();
            break;
          case 'payment':
            optionsData = await getPaymentStatusOptions();
            break;
          case 'payFrequency':
            optionsData = await getPayFrequencyOptions();
            break;
          case 'userRole':
            optionsData = await getUserRoleOptions();
            break;
        }
        
        setOptions(optionsData);
      } catch (error) {
        console.error('Error loading options:', error);
        // Provide fallback options based on type
        setOptions(getFallbackOptions(type));
      } finally {
        setIsLoading(false);
      }
    }

    loadOptions();
  }, [type]);

  const getFallbackOptions = (type: string) => {
    switch (type) {
      case 'job':
        return [
          { id: 'open', label: 'Open' },
          { id: 'assigned', label: 'Assigned' },
          { id: 'in_progress', label: 'In Progress' },
          { id: 'completed', label: 'Completed' },
          { id: 'cancelled', label: 'Cancelled' }
        ];
      case 'payment':
        return [
          { id: 'pending', label: 'Pending' },
          { id: 'completed', label: 'Completed' },
          { id: 'failed', label: 'Failed' },
          { id: 'cancelled', label: 'Cancelled' }
        ];
      case 'payFrequency':
        return [
          { id: 'per_hour', label: 'Per Hour' },
          { id: 'per_day', label: 'Per Day' },
          { id: 'per_week', label: 'Per Week' },
          { id: 'per_month', label: 'Per Month' }
        ];
      case 'userRole':
        return [
          { id: 'worker', label: 'Worker' },
          { id: 'household', label: 'Household' },
          { id: 'admin', label: 'Administrator' }
        ];
      default:
        return [];
    }
  };

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <SelectItem value="loading" disabled>Loading options...</SelectItem>
        ) : (
          options.map(option => (
            <SelectItem key={option.id} value={option.id}>
              <div className="flex flex-col">
                <span>{option.label}</span>
                {option.description && (
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                )}
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
