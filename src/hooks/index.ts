import { useState, useEffect } from 'react';

export function useChartData<T = any>() {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
	let mounted = true;
	setLoading(true);
	// Placeholder implementation: replace with real fetch/logic
	Promise.resolve([] as T[])
	  .then((result) => {
		if (mounted) setData(result);
	  })
	  .finally(() => {
		if (mounted) setLoading(false);
	  });
	return () => {
	  mounted = false;
	};
  }, []);

  return { data, loading, setData };
}

export { useNotifications } from './useNotifications';
export { useProfile } from './useProfile';
export { useTransactions } from './useTransactions';