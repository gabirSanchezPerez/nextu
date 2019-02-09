"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function TimeoutErrorImpl() {
    Error.call(this);
    this.message = 'Timeout has occurred';
    this.name = 'TimeoutError';
    return this;
}
TimeoutErrorImpl.prototype = Object.create(Error.prototype);
/**
 * An error thrown when duetime elapses.
 *
 * @see {@link timeout}
 *
 * @class TimeoutError
 */
exports.TimeoutError = TimeoutErrorImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGltZW91dEVycm9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiVGltZW91dEVycm9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBT0EsU0FBUyxnQkFBZ0I7SUFDdkIsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNqQixJQUFJLENBQUMsT0FBTyxHQUFHLHNCQUFzQixDQUFDO0lBQ3RDLElBQUksQ0FBQyxJQUFJLEdBQUcsY0FBYyxDQUFDO0lBQzNCLE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVELGdCQUFnQixDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUU1RDs7Ozs7O0dBTUc7QUFDVSxRQUFBLFlBQVksR0FBcUIsZ0JBQXVCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgaW50ZXJmYWNlIFRpbWVvdXRFcnJvciBleHRlbmRzIEVycm9yIHtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBUaW1lb3V0RXJyb3JDdG9yIHtcclxuICBuZXcoKTogVGltZW91dEVycm9yO1xyXG59XHJcblxyXG5mdW5jdGlvbiBUaW1lb3V0RXJyb3JJbXBsKHRoaXM6IGFueSkge1xyXG4gIEVycm9yLmNhbGwodGhpcyk7XHJcbiAgdGhpcy5tZXNzYWdlID0gJ1RpbWVvdXQgaGFzIG9jY3VycmVkJztcclxuICB0aGlzLm5hbWUgPSAnVGltZW91dEVycm9yJztcclxuICByZXR1cm4gdGhpcztcclxufVxyXG5cclxuVGltZW91dEVycm9ySW1wbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVycm9yLnByb3RvdHlwZSk7XHJcblxyXG4vKipcclxuICogQW4gZXJyb3IgdGhyb3duIHdoZW4gZHVldGltZSBlbGFwc2VzLlxyXG4gKlxyXG4gKiBAc2VlIHtAbGluayB0aW1lb3V0fVxyXG4gKlxyXG4gKiBAY2xhc3MgVGltZW91dEVycm9yXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgVGltZW91dEVycm9yOiBUaW1lb3V0RXJyb3JDdG9yID0gVGltZW91dEVycm9ySW1wbCBhcyBhbnk7XHJcbiJdfQ==