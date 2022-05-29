const fs = require("fs");
const path = require("path");
const Meta = require("html-metadata-parser");

const History = require("../models/history");
const User = require("../models/user");

const getHistory = async (req, res, next) => {
  try {
    if (req.user == null) {
      const err = new Error("User is not authenticated.");
      err.statusCode = 401;
      throw err;
    }

    const userId = req.user.userId;

    history = [];

    await History.find({ userId: userId }).then((docs) => {
      docs.map((h) => {
        history.push({
          userId: h.userId,
          source: h.source,
          destination: h.destination,
        });
      });
    });

    res.status(200).json({
      message: "History fetched successfully.",
      history: history,
    });
  } catch (err) {
    next(err);
  }
};

const postHistory = async (req, res, next) => {
  try {
    if (req.user == null) {
      const err = new Error("User is not authenticated.");
      err.statusCode = 401;
      throw err;
    }

    const userId = req.user._id;
    const pageId = req.params.pageId;

    const page = await Page.findById(pageId);
    if (!page) {
      const err = new Error("Could not find page by id.");
      err.statusCode = 404;
      throw err;
    }

    // Public pages have no creator, they can be accessed by anybody
    // For private pages, creator and logged-in user have to be the same
    const creatorId = page.creator ? page.creator.toString() : null;
    if (creatorId === userId) {
      res.status(200).json({
        message: "Fetched page successfully.",
        page: page,
      });
    } else {
      const err = new Error("User is not authenticated.");
      err.statusCode = 401;
      throw err;
    }
  } catch (err) {
    next(err);
  }
};

const updateParent = async (pId, url, title, next) => {
  try {
    const page = await Page.findById(pId);
    if (!page) {
      const err = new Error("Could not find page by id.");
      err.statusCode = 404;
      throw err;
    }

    const blocks = page.blocks;
    for (let i = 0; i < blocks.length; i++) {
      let block = blocks[i];
      if (block.imageUrl == url) {
        page.blocks[i].html = title;
        await page.save();
      }
    }
  } catch (err) {
    next(err);
  }
};

const postHistory = async (req, res, next) => {
  try {
    if (req.user == null) {
      const err = new Error("User is not authenticated.");
      err.statusCode = 401;
      throw err;
    }

    const userId = req.user.userId;
    const history = req.body.history;

    var title = await getTitleForUntitled(userId, next);

    const page = new Page({
      title: title,
      blocks: blocks,
      creator: userId || null,
      parent: parent,
    });

    const savedPage = await page.save();

    // Update user collection too
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error("Could not find user by id.");
      err.statusCode = 404;
      throw err;
    }

    user.pages.push(savedPage._id);
    await user.save();

    res.status(201).json({
      message: "Created page successfully.",
      pageId: savedPage._id.toString(),
      title: title,
      blocks: blocks,
      creator: userId || null,
    });
  } catch (err) {
    next(err);
  }
};

const putPage = async (req, res, next) => {
  try {
    if (req.user == null) {
      const err = new Error("User is not authenticated.");
      err.statusCode = 401;
      throw err;
    }

    const userId = req.user._id;
    const pageId = req.params.pageId;
    const blocks = req.body.blocks;

    const page = await Page.findById(pageId);

    if (!page) {
      const err = new Error("Could not find page by id.");
      err.statusCode = 404;
      throw err;
    }

    const creatorId = page.creator ? page.creator.toString() : null;

    if (creatorId === userId) {
      page.blocks = blocks;

      const savedPage = await page.save();

      res.status(200).json({
        message: "Updated page successfully.",
        page: savedPage,
      });
    } else {
      const err = new Error("User is not authenticated.");
      err.statusCode = 401;
      throw err;
    }
  } catch (err) {
    next(err);
  }
};

const getNestedPageIds = async (id, ids) => {
  const page = await Page.findById(id);
  if (!page) return;

  const blocks = page.blocks;
  for (b in blocks) {
    if (blocks[b].tag == "page") {
      let result = blocks[b].imageUrl.substring(3);
      await getNestedPageIds(result, ids);
    }
  }

  ids.push(id);
};

const deletePage = async (req, res, next) => {
  try {
    if (req.user == null) {
      const err = new Error("User is not authenticated.");
      err.statusCode = 401;
      throw err;
    }
    allPages = [];

    const userId = req.user._id;
    let pageId = req.params.pageId;

    await getNestedPageIds(pageId, allPages);

    for (i in allPages) {
      pageId = allPages[i];

      const page = await Page.findById(pageId);

      // Do not throw error

      if (!page) {
        // const err = new Error("Could not find page by id.");
        // err.statusCode = 404;
        // throw err;
        continue;
      }

      // Public pages have no creator, they can be deleted by anybody
      // For private pages, creator and logged-in user have to be the same
      const creatorId = page.creator ? page.creator.toString() : null;
      if (creatorId === userId) {
        const deletedPage = await Page.findByIdAndDelete(pageId);

        // Update user collection too
        if (creatorId) {
          const user = await User.findById(userId);
          if (!user) {
            const err = new Error("Could not find user by id.");
            err.statusCode = 404;
            throw err;
          }
          user.pages.splice(user.pages.indexOf(deletedPage._id), 1);
          await user.save();
        }

        // Delete images folder too (if exists)
        const dir = `images/${pageId}`;
        fs.access(dir, (err) => {
          // If there is no error, the folder does exist
          if (!err && dir !== "images/") {
            fs.rmdirSync(dir, { recursive: true });
          }
        });
      } else {
        const err = new Error("User is not authenticated.");
        err.statusCode = 401;
        throw err;
      }
    }

    res.status(200).json({
      message: "Deleted pages successfully.",
    });
  } catch (err) {
    next(err);
  }
};

const postImage = async (req, res, next) => {
  if (req.file) {
    const file = req.file;
    const result = await S3.uploadFile(file);

    const imageUrl = req.file.path;
    clearImage(imageUrl);

    res.status(200).json({
      message: "Image uploaded successfully!",
      imageUrl: "images/" + result.Key.toString(),
    });
  } else {
    const error = new Error("No image file provided.");
    error.statusCode = 422;
    throw error;
  }
};

const deleteImage = async (req, res, next) => {
  const imageName = req.params.imageName;
  if (imageName) {
    // const imagePath = `images/${imageName}`;
    // clearImage(imagePath);

    const result = await S3.deleteFile(imageName);

    res.status(200).json({
      message: "Deleted image successfully.",
    });
  } else {
    const error = new Error("No imageName provided.");
    error.statusCode = 422;
    throw error;
  }
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};

const getImage = (req, res, next) => {
  const imageName = req.params.imageName;
  const readStream = S3.getFileStream(imageName);

  readStream.pipe(res);
};

const addToArticlesTitle = async (url, title, next) => {
  try {
    var result = await Meta.parser(url);
    var ogTitle = result.og.title ? result.og.title : result.meta.title;
    var ogSite = result.og.site_name;

    if (ogSite != null) {
      title = ogTitle ? `${ogSite} : ${ogTitle}` : ogSite;
    } else {
      title = ogTitle ? `${title} : ${ogTitle}` : title;
    }
    return title;
  } catch (err) {
    next(err);
  }
};

const addToArticles = async (req, res, next) => {
  try {
    if (req.user == null) {
      const err = new Error("User is not authenticated.");
      err.statusCode = 401;
      throw err;
    }

    const userId = req.user._id;
    const url = req.body.url;
    const block = req.body.block;
    var title = req.body.title;
    const pageId = req.body.pageId;
    const isSummary = req.body.isSummary;

    title = await addToArticlesTitle(url, title, next);

    if (pageId != null) {
      const page = await Page.findById(pageId);

      if (page == null) {
        const err = new Error("Page Not Found.");
        err.statusCode = 401;
        throw err;
      }

      if (page.attachedUrl != url) {
        if (isSummary)
          block.html = `Summary for : <a href="${url}">${url}</a>\n\n${block.html}`;
        else
          block.html = `Clipped from : <a href="${url}">${url}</a>\n\n${block.html}`;
      } else {
        if (isSummary) block.html = "Summary : \n" + block.html;
        else block.html = "Clipped : \n" + block.html;
      }

      page.blocks.push(block);
      await page.save();

      return res.status(200).json({
        message: "Article added successfully.",
        page: page,
      });
    }

    if (isSummary) block.html = "Summary : \n" + block.html;
    else block.html = "Clipped : \n" + block.html;

    const page = await Page.findOne({ creator: userId, attachedUrl: url });
    // If page not null
    if (page != null) {
      page.blocks.push(block);
      await page.save();

      return res.status(200).json({
        message: "Article added successfully.",
        page: page,
      });
    }

    // New Page Needs to be created
    // Flow :-
    // 1. Create new page with parent value = article page
    // 2. Put the block from req in the newly created page
    // 3. Create a block for this page and add it into article page
    // 4. Push into users array

    const user = await User.findById(userId);

    if (!user) {
      const err = new Error("User is not authenticated.");
      err.statusCode = 401;
      throw err;
    }

    const defaultBlock = {
      tag: "p",
      html: `Clipped/Summary for : <a href="${url}">${url}</a>`,
      imageUrl: "",
      tab: 0,
    };

    let newPage = new Page({
      title: title,
      blocks: [defaultBlock, block],
      creator: userId,
      attachedUrl: url,
      parent: user.articles,
    });

    let savedPage = await newPage.save();

    let articlePage = await Page.findById(user.articles);

    let articleBlock = {
      tag: "page",
      html: title,
      imageUrl: "/p/" + savedPage._id,
      tab: 0,
    };

    articlePage.blocks.push(articleBlock);

    await articlePage.save();

    user.pages.push(savedPage._id);

    await user.save();

    return res.status(200).json({
      message: "Article added successfully.",
      page: savedPage,
    });
  } catch (err) {
    next(err);
  }
};

const updatePin = async (req, res, next) => {
  try {
    if (req.user == null) {
      const err = new Error("User is not authenticated.");
      err.statusCode = 401;
      throw err;
    }

    pageId = req.body._id;

    if (pageId) {
      const page = await Page.findById(pageId);

      if (page && req.body.pinned != null) {
        page.pinned = req.body.pinned;
        await page.save();
      }

      return res.status(200).json({
        message: "Updated page successfully.",
      });
    } else {
      const err = new Error("Page id cannot be null.");
      err.statusCode = 401;
      throw err;
    }
  } catch (err) {
    next(err);
  }
};

const updateTitle = async (req, res, next) => {
  try {
    if (req.user == null) {
      const err = new Error("User is not authenticated.");
      err.statusCode = 401;
      throw err;
    }

    const userId = req.user._id;
    const pageId = req.body._id;
    var title = req.body.title;

    if (pageId) {
      const page = await Page.findById(pageId);

      if (page && title != null && page.creator.toString() == userId) {
        if (title == "") {
          title = await getTitleForUntitled(userId, next);
        }

        page.title = title;
        await page.save();
        if (page.parent != "")
          await updateParent(page.parent, "/p/" + page._id, title, next);
      }

      return res.status(200).json({
        message: "Updated page successfully.",
      });
    } else {
      const err = new Error("Page id cannot be null");
      err.statusCode = 401;
      throw err;
    }
  } catch (err) {
    next(err);
  }
};

exports.getPages = getPages;
exports.getPage = getPage;
exports.postPage = postPage;
exports.putPage = putPage;
exports.deletePage = deletePage;
exports.postImage = postImage;
exports.deleteImage = deleteImage;
exports.addToArticles = addToArticles;
exports.getImage = getImage;
exports.updatePin = updatePin;
exports.updateTitle = updateTitle;
