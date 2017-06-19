from sqlalchemy.exc import NoInspectionAvailable
from sqlalchemy.inspection import inspect
from sqlalchemy.ext.declarative import clsregistry


def get_vertex_key(cls_orm_model):
    return '{}.{}'.format(cls_orm_model.__module__, get_class_name(cls_orm_model))


def get_class_name(cls_orm_model):
    if getattr(cls_orm_model, 'class_', None):
        return cls_orm_model.class_.__name__
    elif getattr(cls_orm_model, '__name__', None):
        return cls_orm_model.__name__
    else:
        return str(cls_orm_model)


def _r_extract_hierarchy(cls_orm_model, visited: set):
    # avoid cycles
    vertex_key = get_vertex_key(cls_orm_model)
    if vertex_key in visited:
        return
    else:
        visited.add(vertex_key)

    # extract the current vertex
    vertex = {
        'key': vertex_key,
        'name': get_class_name(cls_orm_model),
        'module': cls_orm_model.__module__,
        'relations': [],
    }

    # add edges for relationships
    try:
        mapper = inspect(cls_orm_model)
    except NoInspectionAvailable:
        mapper = None
    if mapper:
        for relation_name in mapper.relationships.keys():
            relation = mapper.relationships[relation_name]

            target = relation.argument
            if isinstance(target, clsregistry._class_resolver):
                target = target()

            back_reference = relation.backref
            if type(back_reference) == tuple:
                back_reference = back_reference[0]

            vertex['relations'].append({
                'source_name': relation_name,
                'source_columns': [c.name for c in relation.local_columns],
                'is_self_referential': relation._is_self_referential,
                'target': get_vertex_key(target),
                'taget_columns': [c.name for c in relation.remote_side],
                'back_reference_name': back_reference,
                'type': relation.direction.name
            })

    # add edges for inheritance
    for child_class in cls_orm_model.__subclasses__():
        vertex['relations'].append({
            'target': get_vertex_key(child_class),
            'type': 'inheritance'
        })

    # output current vertex
    yield vertex_key, vertex

    # recurse
    for child_class in cls_orm_model.__subclasses__():
        yield from _r_extract_hierarchy(child_class, visited)


def extract_hierarchy(root_orm_class):
    return {
        k: v for k,v in _r_extract_hierarchy(root_orm_class, set())
    }
