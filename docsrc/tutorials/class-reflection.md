Here are some useful reflection methods that you can use at runtime.

Given an instance ``instance``, you can execute the following reflections:
- ``instance.cls``: the class that ``instance`` is an instance of
- ``instance.instance_of(cls)``: is this instance an instance of ``cls``?
- ``instance.destroyed()``: is this instance already destroyed?
- ``instance.weakDestroy()``: destroy only if not already destroyed
- ``instance.cid()``: unique id of instance
- ``instance.auto_destroy(obj)``: automatically destroy ``obj`` when destroying ``instance``

Given a class ``cls``, you can execute the following reflections:
- ``cls.parent``: the parent class
- ``cls.children``: all direct child classes
- ``cls.classname``: class name as a string
- ``cls.ancestor_of(cls2)``: is ``cls`` an ancestor of ``cls2``? 
- ``cls.is_class(cls2)``: is ``cls2`` a class?
- ``cls.is_class_instance(instance)``: is ``instance`` a class instance?
- ``cls.is_instance_of(instance)``: is ``instance`` a class instance and an instance of this class?
