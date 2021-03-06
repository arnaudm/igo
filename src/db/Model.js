

const _         = require('lodash');

const Query     = require('./Query');
const Schema    = require('./Schema');


// Simple mixin implementation to set the schema as a static attribute
module.exports = function(schema) {

  class Model {

    constructor(values) {
      _.assign(this, values);
    }

    // returns object with primary keys
    primaryObject() {
      return _.pick(this, this.constructor.schema.primary);
    }

    // update
    update(values, callback) {
      var _this = this;
      values.updated_at = new Date();
      _.assign(_this, values);
      this.beforeUpdate(values, function() {
        new Query(_this.constructor, 'update').unscoped().values(values).where(_this.primaryObject()).execute(function(err, result) {
          if (callback) callback(err, _this);
        });
      });
    }

    // reload
    reload(includes, callback) {
      if (!callback) {
        callback = includes;
      }
      const query = this.constructor.unscoped();
      includes && query.includes(includes);
      query.find(this.id, callback);
    }

    // destroy
    destroy(callback) {
      new Query(this.constructor, 'delete').unscoped().where(this.primaryObject()).execute(callback);
    }

    beforeCreate(callback)          { callback(); }
    beforeUpdate(values, callback)  { callback(); }

    // find by id
    static find(id, callback) {
      new Query(this).find(id, callback);
    }

    // create
    static create(values, options, callback) {
      const _this       = this;

      if (_.isFunction(values)) {
        callback = values;
      }
      if (_.isFunction(options)) {
        callback = options;
      }
      const now = new Date();
      const obj = new this(values);
      if (this.schema.subclasses && !obj[this.schema.subclass_column]) {
        obj[this.schema.subclass_column] = _.findKey(this.schema.subclasses, { name: this.name });
      }

      obj.created_at = obj.created_at || now;
      obj.updated_at = obj.updated_at || now;
      obj.beforeCreate(function() {
        new Query(_this, 'insert').values(obj).options(options).execute(function(err, result) {
          if (err) {
            return callback && callback(err, result);
          }
          const { insertId } = result;
          if (insertId) {
            return _this.unscoped().find(insertId, callback);
          }
          _this.unscoped().find(obj.primaryObject(), callback);
        });
      });
    }

    // return first
    static first(callback) {
      new Query(this).first(callback);
    }

    // return last
    static last(callback) {
      new Query(this).last(callback);
    }

    // return all
    static list(callback) {
      new Query(this).list(callback);
    }

    static all(callback) {
      return this.list(callback);
    }

    //
    static select(select) {
      return new Query(this).select(select);
    }

    // filter
    static where(where, params) {
      return new Query(this).where(where, params);
    }

    // limit
    static limit(offset, limit) {
      return new Query(this).limit(offset, limit);
    }

    // page
    static page(page, nb) {
      return new Query(this).page(page, nb);
    }

    // order
    static order(order) {
      return new Query(this).order(order);
    }

    // distinct
    static distinct(columns) {
      return new Query(this).distinct(columns);
    }

    // group
    static group(columns) {
      return new Query(this).group(columns);
    }

    // count
    static count(callback) {
      return new Query(this).count(callback);
    }

    // destroy
    static destroy(id, callback) {
      return new Query(this, 'delete').unscoped().where({ id: id }).execute(callback);
    }

    // destroy all
    static destroyAll(callback) {
      return new Query(this, 'delete').unscoped().execute(callback);
    }

    //
    static update(values, callback) {
      values.updated_at = new Date();
      return new Query(this).unscoped().update(values, callback);
    }

    // includes
    static includes(includes) {
      return new Query(this).includes(includes);
    }

    //unscoped
    static unscoped() {
      return new Query(this).unscoped();
    }

    //scope
    static scope(scope) {
      return new Query(this).scope(scope);
    }

  }

  Model.schema = new Schema(schema);

  return Model;
}
