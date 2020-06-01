from xblock.core import XBlock

class TestMixin:
    @XBlock.handler
    def render_test_mixin(self, data, suffix=''): #pylint: disable=unused-argument

