import { useEffect, useMemo, useState } from 'react';
import Pusher from 'pusher-js';
import { api } from '../services/api.js';

export const GLOBAL_CHANNEL = 'meshdesk-global';

export function useRealtime() {
  const [client, setClient] = useState(null);

  useEffect(() => {
    let active = true;
    let pusherInstance = null;

    api
      .getPublicConfig()
      .then((config) => {
        if (!active || !config.pusherKey || !config.pusherCluster) {
          return;
        }
        pusherInstance = new Pusher(config.pusherKey, {
          cluster: config.pusherCluster,
        });
        setClient(pusherInstance);
      })
      .catch(() => {});

    return () => {
      active = false;
      if (pusherInstance) {
        pusherInstance.disconnect();
      }
    };
  }, []);

  return useMemo(() => client, [client]);
}
