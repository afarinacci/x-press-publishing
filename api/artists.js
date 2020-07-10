const express = require('express');
const artistsRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || './database.sqlite'
);

artistsRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Artist WHERE is_currently_employed=1`, (err, rows) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({ artists: rows });
    }
  });
});

artistsRouter.param('artistId', (req, res, next, artistId) => {
  db.get(
    'SELECT * FROM Artist WHERE id=$artistId',
    { $artistId: artistId },
    (error, artist) => {
      if (error) {
        next(error);
      } else if (artist) {
        req.artist = artist;
        next();
      } else {
        res.status(404).send();
      }
    }
  );
});

artistsRouter.get('/:artistId', (req, res, next) => {
  res.status(200).json({ artist: req.artist });
});

artistsRouter.post('/', (req, res, next) => {
  const name = req.body.artist.name;
  const dateOfBirth = req.body.artist.dateOfBirth;
  const biography = req.body.artist.biography;
  const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;
  if (!name || !dateOfBirth || !biography) {
    res.status(400).send();
  }
  db.run(
    'INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)',
    {
      $name: name,
      $dateOfBirth: dateOfBirth,
      $biography: biography,
      $isCurrentlyEmployed: isCurrentlyEmployed,
    },
    function (error) {
      if (error) {
        next(error);
      }
      const id = this.lastID;
      db.get(`SELECT * FROM Artist WHERE id=$id`, { $id: id }, (err, row) => {
        if (err) {
          next(err);
        } else {
          res.status(201).json({ artist: row });
        }
      });
    }
  );
});

artistsRouter.put('/:artistId', (req, res, next) => {
  const name = req.body.artist.name;
  const dateOfBirth = req.body.artist.dateOfBirth;
  const biography = req.body.artist.biography;
  const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;
  if (!name || !dateOfBirth || !biography) {
    res.status(400).send();
  }
  db.run(
    'UPDATE Artist SET name = $name, date_of_birth = $dateOfBirth, biography = $biography, is_currently_employed = $isCurrentlyEmployed WHERE Artist.id = $artistId',
    {
      $name: name,
      $dateOfBirth: dateOfBirth,
      $biography: biography,
      $isCurrentlyEmployed: isCurrentlyEmployed,
      $artistId: req.params.artistId,
    },
    (error) => {
      if (error) {
        next(error);
      } else {
        db.get(
          `SELECT * FROM Artist WHERE id=$id`,
          { $id: req.params.artistId },
          (err, row) => {
            if (err) {
              next(err);
            } else {
              res.status(200).json({ artist: row });
            }
          }
        );
      }
    }
  );
});

artistsRouter.delete('/:artistId', (req, res, next) => {
  db.run(
    'UPDATE Artist SET is_currently_employed = 0 WHERE Artist.id = $artistId',
    { $artistId: req.params.artistId },
    (error) => {
      if (error) {
        next(error);
      } else {
        db.get(
          `SELECT * FROM Artist WHERE id=$id`,
          { $id: req.params.artistId },
          (err, row) => {
            if (err) {
              next(err);
            } else {
              res.status(200).json({ artist: row });
            }
          }
        );
      }
    }
  );
});

module.exports = artistsRouter;
