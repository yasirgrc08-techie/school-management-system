const subjectService = require('../services/subject.service');

class SubjectController {
  async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;
      const result = await subjectService.findAll({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        search,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const subject = await subjectService.findById(req.params.id);
      res.json(subject);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const subject = await subjectService.create(req.body);
      res.status(201).json(subject);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const subject = await subjectService.update(req.params.id, req.body);
      res.json(subject);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await subjectService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SubjectController();
