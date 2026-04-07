const userService = require('../services/user.service');

class UserController {
  async getAll(req, res, next) {
    try {
      const { page, limit, role, search } = req.query;
      const result = await userService.findAll({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        role,
        search,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const user = await userService.findById(req.params.id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const user = await userService.create(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const user = await userService.update(req.params.id, req.body);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await userService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
