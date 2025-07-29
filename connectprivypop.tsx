import { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';

const ConnectPrivyPop = () => {
  const { ready, authenticated, login } = usePrivy();

  useEffect(() => {
    if (ready && !authenticated) {
      try {
        login(); 
      } catch (err: unknown) {
        // console.error('❌ Auto login failed:', err);
      }
    }
  }, [ready, authenticated]);

  return null; 
};

export default ConnectPrivyPop;