const classService = require('../services/class.service');

class ClassController {
  async getAll(req, res, next) {
    try {
      const { page, limit, teacherId, search } = req.query;
      const result = await classService.findAll({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        teacherId,
        search,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const cls = await classService.findById(req.params.id);
      res.json(cls);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const cls = await classService.create(req.body);
      res.status(201).json(cls);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const cls = await classService.update(req.params.id, req.body);
      res.json(cls);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await classService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async enrollStudent(req, res, next) {
    try {
      const enrollment = await classService.enrollStudent(req.params.id, req.body.studentId);
      res.status(201).json(enrollment);
    } catch (error) {
      next(error);
    }
  }

  async unenrollStudent(req, res, next) {
    try {
      await classService.unenrollStudent(req.params.id, req.params.studentId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ClassController();
