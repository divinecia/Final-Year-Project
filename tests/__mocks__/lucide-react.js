// Mock for lucide-react icons
const mockIcon = (props) => {
  return {
    $$typeof: Symbol.for('react.element'),
    type: 'svg',
    props: {
      ...props,
      'data-testid': 'mock-lucide-icon',
    },
    key: null,
    ref: null,
  };
};

// Export common icons used in the app
export const Bell = mockIcon;
export const X = mockIcon;
export const Check = mockIcon;
export const AlertTriangle = mockIcon;
export const Info = mockIcon;
export const User = mockIcon;
export const Settings = mockIcon;
export const LogOut = mockIcon;
export const Home = mockIcon;
export const Users = mockIcon;
export const Briefcase = mockIcon;
export const Wallet = mockIcon;
export const AreaChart = mockIcon;
export const GraduationCap = mockIcon;
export const Package = mockIcon;

// Default export
export default mockIcon;
