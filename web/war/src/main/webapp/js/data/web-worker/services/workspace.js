
define(['../util/ajax', '../util/store'], function(ajax, store) {
    'use strict';

    return {
        diff: function(workspaceId) {
            return ajax('GET', '/workspace/diff', {
                workspaceId: workspaceId || publicData.currentWorkspaceId
            });
        },

        all: function() {
            return ajax('GET', '/workspace/all');
        },

        get: function(workspaceId) {
            return ajax('GET', '/workspace', {
                workspaceId: workspaceId || publicData.currentWorkspaceId
            }).then(function(workspace) {
                workspace.vertices = _.indexBy(workspace.vertices, 'vertexId');
                return workspace;
            });
        },

        'delete': function(workspaceId) {
            return ajax('DELETE', '/workspace', {
                workspaceId: workspaceId
            });
        },

        save: function(workspaceId, changes) {
            if (arguments.length === 1) {
                changes = workspaceId;
                workspaceId = publicData.currentWorkspaceId;
            }

            var workspace = store.getObject(workspaceId, 'workspace');

            if (_.isEmpty(changes)) {
                console.warn('Workspace update called with no changes');
                return Promise.resolve(workspace);
            }

            var allChanges = _.extend({}, {
                entityUpdates: [],
                entityDeletes: [],
                userUpdates: [],
                userDeletes: []
            }, changes || {});

            allChanges.entityUpdates.forEach(function(entityUpdate) {
                var p = entityUpdate.graphPosition;
                if (p) {
                    p.x = Math.round(p.x);
                    p.y = Math.round(p.y);
                }
            })

            if (!store.workspaceWillChange(workspace, allChanges)) {
                return Promise.resolve(workspace);
            }

            return ajax('POST', '/workspace/update', {
                workspaceId: workspaceId,
                data: JSON.stringify(allChanges)
            }).then(function() {
                return store.updateWorkspace(workspaceId, allChanges)
            })
        },

        vertices: function(workspaceId) {
            return ajax('GET', '/workspace/vertices', {
                workspaceId: workspaceId || publicData.currentWorkspaceId
            });
        },

        edges: function(workspaceId, additionalVertices) {
            return ajax('GET', '/workspace/edges', {
                workspaceId: workspaceId || publicData.currentWorkspaceId
            }).then(function(result) {
                return result.edges;
            })
        },

        create: function(options) {
            return ajax('POST', '/workspace/create', options);
        }
    }
})
