const express = require("express");
const app = express();
const _ = require("lodash");
const middlewares = require("./middlewares/index");
const PORT = 5000;

app.use(express.json());

app.get(
  "/api/blog-stats",
  middlewares.blogData,
  middlewares.error,
  (req, res) => {
    const blogsArr = req.blogs;

    const blogAnalytics = (blogsArr) => {
      const totalBlogs = _.size(blogsArr);
      const longestTitle = _.maxBy(blogsArr, (b) => b.title.length).title;
      const blogsWithPrivacyTitle = _.filter(blogsArr, (b) =>
        _.includes(_.toLower(b.title), "privacy")
      ).length;
      const uniqueBlogTitles = _.uniqBy(blogsArr, "title").map((b) => b.title);

      const blogStatistics = {
        total_blogs: totalBlogs,
        longest_title: longestTitle,
        blogs_with_privacy_title: blogsWithPrivacyTitle,
        unique_blog_titles: uniqueBlogTitles,
      };

      return blogStatistics;
    };

    const memoizedBlogAnalytics = _.memoize(blogAnalytics);

    const blogStatistics = memoizedBlogAnalytics(blogsArr);

    res.json({
      blog_statistics: blogStatistics,
    });
  }
);

app.get(
  "/api/blog-search",
  middlewares.blogData,
  middlewares.error,
  (req, res) => {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }
    const blogsArr = req.blogs;

    const searchBlogs = (query, blogsArr) => {
      let searchBlogs = [];

      for (let i = 0; i < blogsArr.length; i++) {
        const title = blogsArr[i].title.toLowerCase();
        if (title.indexOf(query.toLowerCase()) != -1) {
          searchBlogs.push(blogsArr[i]);
        }
      }

      return searchBlogs;
    };

    const memoizeSearchBlogs = _.memoize(searchBlogs);

    const searchResult = memoizeSearchBlogs(query, blogsArr);

    res.json({ blogs: searchResult });
  }
);

app.use(middlewares.error);

app.listen(PORT, () => {
  console.log("Server running at port", PORT);
});
