'use_strict';

const express       = require('express');
const router        = express.Router();
const elasticsearch = require('elasticsearch');

const client = new elasticsearch.Client({
  host: process.env.ELASTIC_URL,
});

// GET: Search for a course
router.get('/courses/:q', function searchCourse(req, res) {
  client.search({
    index: 'test',
    type: 'Course',
    body: {
      query: {
        multi_match: {
          query: req.params.q,
          fields: [
            'abbr^5',
            'title^4',
            'subjectCode^5',
            'description^3',
          ],
        },
      },
    },
  },
  (err, response) => {
    if (err) {
      console.error(err);
    } else if (response.hits.hits.length === 0) {
      res.status(404).json({ 'ohsh***': 'not found' });
    } else {
      const classmereResponse = response.hits.hits.map((hit) => {
        const course = hit._source;
        return {
          title: course.title,
          subjectCode: course.subjectCode,
          courseNumber: course.courseNumber,
          credits: course.credits,
          description: course.description,
          hitScore: hit._score,
        };
      });
      res.json(classmereResponse);
    }
  });
});

module.exports = router;
