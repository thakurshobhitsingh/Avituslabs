import {usePrivy} from '@privy-io/react-auth';

export function UsePrivy() {
  const {ready} = usePrivy();

  if (!ready) {
    return <div>Loading...</div>;
  }

  return <div>Privy is ready!</div>;
}