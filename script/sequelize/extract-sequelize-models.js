var _           = require('lodash');
var Sequelize   = require('sequelize');


function extractModelGraph(sequelizeModels) {
    var M2M_ASSOCIATION_TYPE_NAMES = ['BelongsToMany', 'HasMany'];
    var throughModels = {};

    return _(sequelizeModels)
            .pick(function (model) {
                return (model instanceof Sequelize.Model);
            })
            .map(function(model) {
                return {
                    name: model.name,
                    relations: _.map(model.associations, function (association) {
                        var associationType = association.associationType;
                        var isM2M = _.contains(M2M_ASSOCIATION_TYPE_NAMES, associationType);

                        // mark through models for later exclusion
                        if (isM2M && association.throughModel) {
                            throughModels[association.throughModel.name] = 1;
                        }

                        var targetField;
                        if (isM2M) {
                            targetField = association.targetIdentifier || association.target.primaryKeyField;
                        } else if (associationType === 'HasOne') {
                            targetField = association.foreignKey;
                        } else {
                            targetField = association.targetIdentifier;
                        }

                        return {
                            target: association.target.name,
                            target_field: targetField,
                            field: association.identifier || association.identifierField,
                            type: associationType
                        };
                    })
                }
            })
            .filter(function (node) { return throughModels[node.name] !== 1; })
            .value();
}
