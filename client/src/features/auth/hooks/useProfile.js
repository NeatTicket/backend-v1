import useSWR from 'swr';
import axiosInstance from '../../../lib/axios';

const fetcher = (url) => axiosInstance.get(url).then(res => res.data.data);

export const useProfile = () => {
    const token = localStorage.getItem('neatTicketToken');
    const { data, error, isLoading, mutate } = useSWR(token ? '/profile' : null, fetcher, {
        revalidateOnFocus: true,
        dedupingInterval: 5000
    });

    return {
        profile: data && data.user ? data.user : null,
        isLoading,
        error: error ? error.message : null,
        mutate
    };
};
