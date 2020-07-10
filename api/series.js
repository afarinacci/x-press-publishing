const express = require('express');
const seriesRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || './database.sqlite'
);

seriesRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Series`, (err, rows) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({ series: rows });
    }
  });
});

seriesRouter.param('seriesId', (req, res, next, seriesId) => {
  db.get(
    'SELECT * FROM Series WHERE id=$seriesId',
    { $seriesId: seriesId },
    (error, series) => {
      if (error) {
        next(error);
      } else if (series) {
        req.series = series;
        next();
      } else {
        res.status(404).send();
      }
    }
  );
});

seriesRouter.get('/:seriesId', (req, res, next) => {
  res.status(200).json({ series: req.series });
});

seriesRouter.post('/', (req, res, next) => {
  const name = req.body.series.name;
  const description = req.body.series.description;
  if (!name || !description) {
    res.status(400).send();
  }
  db.run(
    'INSERT INTO Series (name, description) VALUES ($name, $description)',
    {
      $name: name,
      $description: description,
    },
    function (error) {
      if (error) {
        next(error);
      }
      const id = this.lastID;
      db.get(`SELECT * FROM Series WHERE id=$id`, { $id: id }, (err, row) => {
        if (err) {
          next(err);
        } else {
          res.status(201).json({ series: row });
        }
      });
    }
  );
});

seriesRouter.put('/:seriesId', (req, res, next) => {
  const name = req.body.series.name;
  const description = req.body.series.description;
  if (!name || !description) {
    res.status(400).send();
  }
  db.run(
    'UPDATE Series SET name = $name, description = $description WHERE Series.id = $seriesId',
    {
      $name: name,
      $description: description,
      $seriesId: req.params.seriesId,
    },
    (error) => {
      if (error) {
        next(error);
      } else {
        db.get(
          `SELECT * FROM Series WHERE id=$id`,
          { $id: req.params.seriesId },
          (err, row) => {
            if (err) {
              next(err);
            } else {
              res.status(200).json({ series: row });
            }
          }
        );
      }
    }
  );
});

module.exports = seriesRouter;
