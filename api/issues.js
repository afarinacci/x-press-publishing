const express = require('express');
const issuesRouter = express.Router({ mergeParams: true });

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || './database.sqlite'
);

issuesRouter.param('issueId', (req, res, next, issueId) => {
  db.get(
    'SELECT * FROM Issue WHERE id=$issueId',
    { $issueId: issueId },
    (error, issue) => {
      if (error) {
        next(error);
      } else if (issue) {
        req.issue = issue;
        next();
      } else {
        return res.status(404).send();
      }
    }
  );
});

issuesRouter.get('/', (req, res, next) => {
  db.all(
    `SELECT * FROM Issue WHERE series_id=${req.params.seriesId}`,
    (err, issues) => {
      if (err) {
        next(err);
      } else {
        res.status(200).send({ issues: issues });
      }
    }
  );
});

issuesRouter.post('/', (req, res, next) => {
  const name = req.body.issue.name;
  const issueNumber = req.body.issue.issueNumber;
  const publicationDate = req.body.issue.publicationDate;
  const artistId = req.body.issue.artistId;
  const artistSQL = `SELECT * FROM Artist WHERE Artist.id = $artistId`;
  const artistValues = { $artistId: artistId };
  db.get(artistSQL, artistValues, (err, artist) => {
    if (err) {
      next(err);
    } else {
      if (!name || !issueNumber || !publicationDate || !artist) {
        return res.status(400).send();
      }
      const sql =
        'INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id)' +
        'VALUES ($name, $issueNumber, $publicationDate, $artistId, $seriesId)';
      const values = {
        $name: name,
        $issueNumber: issueNumber,
        $publicationDate: publicationDate,
        $artistId: artistId,
        $seriesId: req.params.seriesId,
      };
      db.run(sql, values, function (error) {
        if (error) {
          next(error);
        } else {
          db.get(
            `SELECT * FROM Issue WHERE id=${this.lastID}`,
            (err, issue) => {
              if (err) {
                next(err);
              } else {
                res.status(201).json({ issue: issue });
              }
            }
          );
        }
      });
    }
  });
});

issuesRouter.put('/:issueId', (req, res, next) => {
  const name = req.body.issue.name;
  const issueNumber = req.body.issue.issueNumber;
  const publicationDate = req.body.issue.publicationDate;
  const artistId = req.body.issue.artistId;
  const artistSQL = `SELECT * FROM Artist WHERE Artist.id = $artistId`;
  const artistValues = { $artistId: artistId };
  db.get(artistSQL, artistValues, (err, artist) => {
    if (err) {
      next(err);
    } else {
      if (!name || !issueNumber || !publicationDate || !artist) {
        return res.status(400).send();
      } else {
        const sql =
          'UPDATE Issue SET name=$name, issue_number=$issueNumber, publication_date=$publicationDate, artist_id=$artistId WHERE Issue.id=$issueId';
        const values = {
          $name: name,
          $issueNumber: issueNumber,
          $publicationDate: publicationDate,
          $artistId: artistId,
          $issueId: req.params.issueId,
        };
        db.run(sql, values, function (err) {
          if (err) {
            next(err);
          } else {
            db.get(
              `SELECT * FROM Issue WHERE id=${req.params.issueId}`,
              (err, issue) => {
                if (err) {
                  next(err);
                } else {
                  res.status(200).json({ issue: issue });
                }
              }
            );
          }
        });
      }
    }
  });
});

issuesRouter.delete('/:issueId', (req, res, next) => {
  db.run(`DELETE FROM Issue WHERE id=${req.params.issueId}`, function (error) {
    if (error) {
      next(error);
    } else {
      res.status(204).send();
    }
  });
});

module.exports = issuesRouter;
