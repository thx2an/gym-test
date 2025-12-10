const Review = require('../../Models/Review');

class ReviewController {

    async addReview(req, res) {
        try {
            const { trainerId, rating, comment } = req.body;
            const userId = req.user.id;

            // 1. Verify eligibility (Must have trained with this trainer)
            const canReview = await Review.hasCompletedSession(userId, trainerId);
            if (!canReview) {
                return res.status(403).json({ status: false, message: 'You can only review trainers you have trained with.' });
            }

            // 2. Add Review
            await Review.create({
                user_id: userId,
                trainer_id: trainerId,
                rating,
                comment
            });

            res.json({ status: true, message: 'Review submitted successfully' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: 'Server Error' });
        }
    }

    async getTrainerReviews(req, res) {
        try {
            const { trainerId } = req.params;
            const reviews = await Review.getByTrainer(trainerId);
            res.json({ status: true, data: reviews });
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: 'Server Error' });
        }
    }
}

module.exports = new ReviewController();
