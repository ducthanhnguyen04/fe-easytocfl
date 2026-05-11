import axiosClient from "@/lib/axios"; 

const lessonService = {
    getLessonsByLevelId: async (id: number | string) => {
        try {
            const response = await axiosClient.get(`/lessons/get-lesson-by-level-id`, {
                params: { levelId: id }
            });
            return response;
        } catch (error) {
            console.error("Error in getLessonsByLevelId:", error);
            throw error;
        }
    }
};

export default lessonService;