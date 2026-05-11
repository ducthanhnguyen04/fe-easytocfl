import axiosClient from "@/lib/axios"; 

const vocabularyService = {
    getVocabularyByLessonId: async (id: number | string) => {
        try {
            const response = await axiosClient.get(`/vocabularies/get-vocabulary-by-lesson-id`, {
                params: { lessonId: id }
            });
            return response;
        } catch (error) {
            console.error("Error in getVocabularyByLessonId:", error);
            throw error;
        }
    }
}

export default vocabularyService;