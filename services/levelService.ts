import axiosClient from '@/lib/axios';

export interface LevelData {
    id?: number;
    levelName: string;
    level: string; 
}

const levelService = {
    getAllLevels: async () => {
        return axiosClient.get('/levels/get-all'); 
    },

    getLevelById: async (id: number | string) => {
        return axiosClient.get(`/levels/${id}`);
    },

    createLevel: async (data: LevelData) => {
        return axiosClient.post('/levels', data);
    },

    updateLevel: async (id: number | string, data: LevelData) => {
        return axiosClient.put(`/levels/${id}`, data);
    },

    deleteLevel: async (id: number | string) => {
        return axiosClient.delete(`/levels/${id}`);
    }
};

export default levelService;