const BlogCategory = require('../../Models/BlogCategory');
const BlogPost = require('../../Models/BlogPost');

class BlogController {

    // Categories
    async getCategories(req, res) {
        try {
            const data = await BlogCategory.all();
            res.json({ status: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: 'Server Error' });
        }
    }

    async createCategory(req, res) {
        try {
            await BlogCategory.create(req.body.name);
            res.json({ status: true, message: 'Category created' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: 'Server Error' });
        }
    }

    // Posts
    async getPosts(req, res) {
        try {
            const data = await BlogPost.all();
            res.json({ status: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: 'Server Error' });
        }
    }

    async createPost(req, res) {
        try {
            const { title, content, categoryId, imageUrl } = req.body;
            const authorId = req.user.id;

            await BlogPost.create({
                title, content, category_id: categoryId, image_url: imageUrl, author_id: authorId
            });
            res.json({ status: true, message: 'Post created' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: 'Server Error' });
        }
    }

    async getPostDetail(req, res) {
        try {
            const { id } = req.params;
            const post = await BlogPost.findById(id);
            if (!post) return res.status(404).json({ status: false, message: 'Post not found' });

            res.json({ status: true, data: post });
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: 'Server Error' });
        }
    }
}

module.exports = new BlogController();
