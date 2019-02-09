"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var async_1 = require("../scheduler/async");
var Subscriber_1 = require("../Subscriber");
var isScheduler_1 = require("../util/isScheduler");
/* tslint:enable:max-line-length */
/**
 * Buffers the source Observable values for a specific time period.
 *
 * <span class="informal">Collects values from the past as an array, and emits
 * those arrays periodically in time.</span>
 *
 * ![](bufferTime.png)
 *
 * Buffers values from the source for a specific time duration `bufferTimeSpan`.
 * Unless the optional argument `bufferCreationInterval` is given, it emits and
 * resets the buffer every `bufferTimeSpan` milliseconds. If
 * `bufferCreationInterval` is given, this operator opens the buffer every
 * `bufferCreationInterval` milliseconds and closes (emits and resets) the
 * buffer every `bufferTimeSpan` milliseconds. When the optional argument
 * `maxBufferSize` is specified, the buffer will be closed either after
 * `bufferTimeSpan` milliseconds or when it contains `maxBufferSize` elements.
 *
 * ## Examples
 *
 * Every second, emit an array of the recent click events
 *
 * ```javascript
 * const clicks = fromEvent(document, 'click');
 * const buffered = clicks.pipe(bufferTime(1000));
 * buffered.subscribe(x => console.log(x));
 * ```
 *
 * Every 5 seconds, emit the click events from the next 2 seconds
 *
 * ```javascript
 * const clicks = fromEvent(document, 'click');
 * const buffered = clicks.pipe(bufferTime(2000, 5000));
 * buffered.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link buffer}
 * @see {@link bufferCount}
 * @see {@link bufferToggle}
 * @see {@link bufferWhen}
 * @see {@link windowTime}
 *
 * @param {number} bufferTimeSpan The amount of time to fill each buffer array.
 * @param {number} [bufferCreationInterval] The interval at which to start new
 * buffers.
 * @param {number} [maxBufferSize] The maximum buffer size.
 * @param {SchedulerLike} [scheduler=async] The scheduler on which to schedule the
 * intervals that determine buffer boundaries.
 * @return {Observable<T[]>} An observable of arrays of buffered values.
 * @method bufferTime
 * @owner Observable
 */
function bufferTime(bufferTimeSpan) {
    var length = arguments.length;
    var scheduler = async_1.async;
    if (isScheduler_1.isScheduler(arguments[arguments.length - 1])) {
        scheduler = arguments[arguments.length - 1];
        length--;
    }
    var bufferCreationInterval = null;
    if (length >= 2) {
        bufferCreationInterval = arguments[1];
    }
    var maxBufferSize = Number.POSITIVE_INFINITY;
    if (length >= 3) {
        maxBufferSize = arguments[2];
    }
    return function bufferTimeOperatorFunction(source) {
        return source.lift(new BufferTimeOperator(bufferTimeSpan, bufferCreationInterval, maxBufferSize, scheduler));
    };
}
exports.bufferTime = bufferTime;
var BufferTimeOperator = /** @class */ (function () {
    function BufferTimeOperator(bufferTimeSpan, bufferCreationInterval, maxBufferSize, scheduler) {
        this.bufferTimeSpan = bufferTimeSpan;
        this.bufferCreationInterval = bufferCreationInterval;
        this.maxBufferSize = maxBufferSize;
        this.scheduler = scheduler;
    }
    BufferTimeOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new BufferTimeSubscriber(subscriber, this.bufferTimeSpan, this.bufferCreationInterval, this.maxBufferSize, this.scheduler));
    };
    return BufferTimeOperator;
}());
var Context = /** @class */ (function () {
    function Context() {
        this.buffer = [];
    }
    return Context;
}());
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
var BufferTimeSubscriber = /** @class */ (function (_super) {
    __extends(BufferTimeSubscriber, _super);
    function BufferTimeSubscriber(destination, bufferTimeSpan, bufferCreationInterval, maxBufferSize, scheduler) {
        var _this = _super.call(this, destination) || this;
        _this.bufferTimeSpan = bufferTimeSpan;
        _this.bufferCreationInterval = bufferCreationInterval;
        _this.maxBufferSize = maxBufferSize;
        _this.scheduler = scheduler;
        _this.contexts = [];
        var context = _this.openContext();
        _this.timespanOnly = bufferCreationInterval == null || bufferCreationInterval < 0;
        if (_this.timespanOnly) {
            var timeSpanOnlyState = { subscriber: _this, context: context, bufferTimeSpan: bufferTimeSpan };
            _this.add(context.closeAction = scheduler.schedule(dispatchBufferTimeSpanOnly, bufferTimeSpan, timeSpanOnlyState));
        }
        else {
            var closeState = { subscriber: _this, context: context };
            var creationState = { bufferTimeSpan: bufferTimeSpan, bufferCreationInterval: bufferCreationInterval, subscriber: _this, scheduler: scheduler };
            _this.add(context.closeAction = scheduler.schedule(dispatchBufferClose, bufferTimeSpan, closeState));
            _this.add(scheduler.schedule(dispatchBufferCreation, bufferCreationInterval, creationState));
        }
        return _this;
    }
    BufferTimeSubscriber.prototype._next = function (value) {
        var contexts = this.contexts;
        var len = contexts.length;
        var filledBufferContext;
        for (var i = 0; i < len; i++) {
            var context = contexts[i];
            var buffer = context.buffer;
            buffer.push(value);
            if (buffer.length == this.maxBufferSize) {
                filledBufferContext = context;
            }
        }
        if (filledBufferContext) {
            this.onBufferFull(filledBufferContext);
        }
    };
    BufferTimeSubscriber.prototype._error = function (err) {
        this.contexts.length = 0;
        _super.prototype._error.call(this, err);
    };
    BufferTimeSubscriber.prototype._complete = function () {
        var _a = this, contexts = _a.contexts, destination = _a.destination;
        while (contexts.length > 0) {
            var context = contexts.shift();
            destination.next(context.buffer);
        }
        _super.prototype._complete.call(this);
    };
    /** @deprecated This is an internal implementation detail, do not use. */
    BufferTimeSubscriber.prototype._unsubscribe = function () {
        this.contexts = null;
    };
    BufferTimeSubscriber.prototype.onBufferFull = function (context) {
        this.closeContext(context);
        var closeAction = context.closeAction;
        closeAction.unsubscribe();
        this.remove(closeAction);
        if (!this.closed && this.timespanOnly) {
            context = this.openContext();
            var bufferTimeSpan = this.bufferTimeSpan;
            var timeSpanOnlyState = { subscriber: this, context: context, bufferTimeSpan: bufferTimeSpan };
            this.add(context.closeAction = this.scheduler.schedule(dispatchBufferTimeSpanOnly, bufferTimeSpan, timeSpanOnlyState));
        }
    };
    BufferTimeSubscriber.prototype.openContext = function () {
        var context = new Context();
        this.contexts.push(context);
        return context;
    };
    BufferTimeSubscriber.prototype.closeContext = function (context) {
        this.destination.next(context.buffer);
        var contexts = this.contexts;
        var spliceIndex = contexts ? contexts.indexOf(context) : -1;
        if (spliceIndex >= 0) {
            contexts.splice(contexts.indexOf(context), 1);
        }
    };
    return BufferTimeSubscriber;
}(Subscriber_1.Subscriber));
function dispatchBufferTimeSpanOnly(state) {
    var subscriber = state.subscriber;
    var prevContext = state.context;
    if (prevContext) {
        subscriber.closeContext(prevContext);
    }
    if (!subscriber.closed) {
        state.context = subscriber.openContext();
        state.context.closeAction = this.schedule(state, state.bufferTimeSpan);
    }
}
function dispatchBufferCreation(state) {
    var bufferCreationInterval = state.bufferCreationInterval, bufferTimeSpan = state.bufferTimeSpan, subscriber = state.subscriber, scheduler = state.scheduler;
    var context = subscriber.openContext();
    var action = this;
    if (!subscriber.closed) {
        subscriber.add(context.closeAction = scheduler.schedule(dispatchBufferClose, bufferTimeSpan, { subscriber: subscriber, context: context }));
        action.schedule(state, bufferCreationInterval);
    }
}
function dispatchBufferClose(arg) {
    var subscriber = arg.subscriber, context = arg.context;
    subscriber.closeContext(context);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVmZmVyVGltZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJ1ZmZlclRpbWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSw0Q0FBMkM7QUFFM0MsNENBQTJDO0FBRTNDLG1EQUFrRDtBQU9sRCxtQ0FBbUM7QUFFbkM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0RHO0FBQ0gsU0FBZ0IsVUFBVSxDQUFJLGNBQXNCO0lBQ2xELElBQUksTUFBTSxHQUFXLFNBQVMsQ0FBQyxNQUFNLENBQUM7SUFFdEMsSUFBSSxTQUFTLEdBQWtCLGFBQUssQ0FBQztJQUNyQyxJQUFJLHlCQUFXLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUNoRCxTQUFTLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDNUMsTUFBTSxFQUFFLENBQUM7S0FDVjtJQUVELElBQUksc0JBQXNCLEdBQVcsSUFBSSxDQUFDO0lBQzFDLElBQUksTUFBTSxJQUFJLENBQUMsRUFBRTtRQUNmLHNCQUFzQixHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUN2QztJQUVELElBQUksYUFBYSxHQUFXLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQztJQUNyRCxJQUFJLE1BQU0sSUFBSSxDQUFDLEVBQUU7UUFDZixhQUFhLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzlCO0lBRUQsT0FBTyxTQUFTLDBCQUEwQixDQUFDLE1BQXFCO1FBQzlELE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLGtCQUFrQixDQUFJLGNBQWMsRUFBRSxzQkFBc0IsRUFBRSxhQUFhLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztJQUNsSCxDQUFDLENBQUM7QUFDSixDQUFDO0FBdEJELGdDQXNCQztBQUVEO0lBQ0UsNEJBQW9CLGNBQXNC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QUM7SUFDbEMsSUFBSSxXQUFXLEVBQUU7UUFDZixVQUFVLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQ3RDO0lBRUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUU7UUFDdEIsS0FBSyxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDekMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0tBQ3hFO0FBQ0gsQ0FBQztBQUVELFNBQVMsc0JBQXNCLENBQWlELEtBQTJCO0lBQ2pHLElBQUEscURBQXNCLEVBQUUscUNBQWMsRUFBRSw2QkFBVSxFQUFFLDJCQUFTLENBQVc7SUFDaEYsSUFBTSxPQUFPLEdBQUcsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3pDLElBQU0sTUFBTSxHQUEwQyxJQUFJLENBQUM7SUFDM0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUU7UUFDdEIsVUFBVSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQXNCLG1CQUFtQixFQUFFLGNBQWMsRUFBRSxFQUFFLFVBQVUsWUFBQSxFQUFFLE9BQU8sU0FBQSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzVJLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLHNCQUFzQixDQUFDLENBQUM7S0FDaEQ7QUFDSCxDQUFDO0FBRUQsU0FBUyxtQkFBbUIsQ0FBSSxHQUF3QjtJQUM5QyxJQUFBLDJCQUFVLEVBQUUscUJBQU8sQ0FBUztJQUNwQyxVQUFVLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ25DLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBPcGVyYXRvciB9IGZyb20gJy4uL09wZXJhdG9yJztcbmltcG9ydCB7IGFzeW5jIH0gZnJvbSAnLi4vc2NoZWR1bGVyL2FzeW5jJztcbmltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICcuLi9PYnNlcnZhYmxlJztcbmltcG9ydCB7IFN1YnNjcmliZXIgfSBmcm9tICcuLi9TdWJzY3JpYmVyJztcbmltcG9ydCB7IFN1YnNjcmlwdGlvbiB9IGZyb20gJy4uL1N1YnNjcmlwdGlvbic7XG5pbXBvcnQgeyBpc1NjaGVkdWxlciB9IGZyb20gJy4uL3V0aWwvaXNTY2hlZHVsZXInO1xuaW1wb3J0IHsgT3BlcmF0b3JGdW5jdGlvbiwgU2NoZWR1bGVyQWN0aW9uLCBTY2hlZHVsZXJMaWtlIH0gZnJvbSAnLi4vdHlwZXMnO1xuXG4vKiB0c2xpbnQ6ZGlzYWJsZTptYXgtbGluZS1sZW5ndGggKi9cbmV4cG9ydCBmdW5jdGlvbiBidWZmZXJUaW1lPFQ+KGJ1ZmZlclRpbWVTcGFuOiBudW1iZXIsIHNjaGVkdWxlcj86IFNjaGVkdWxlckxpa2UpOiBPcGVyYXRvckZ1bmN0aW9uPFQsIFRbXT47XG5leHBvcnQgZnVuY3Rpb24gYnVmZmVyVGltZTxUPihidWZmZXJUaW1lU3BhbjogbnVtYmVyLCBidWZmZXJDcmVhdGlvbkludGVydmFsOiBudW1iZXIgfCBudWxsIHwgdW5kZWZpbmVkLCBzY2hlZHVsZXI/OiBTY2hlZHVsZXJMaWtlKTogT3BlcmF0b3JGdW5jdGlvbjxULCBUW10+O1xuZXhwb3J0IGZ1bmN0aW9uIGJ1ZmZlclRpbWU8VD4oYnVmZmVyVGltZVNwYW46IG51bWJlciwgYnVmZmVyQ3JlYXRpb25JbnRlcnZhbDogbnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZCwgbWF4QnVmZmVyU2l6ZTogbnVtYmVyLCBzY2hlZHVsZXI/OiBTY2hlZHVsZXJMaWtlKTogT3BlcmF0b3JGdW5jdGlvbjxULCBUW10+O1xuLyogdHNsaW50OmVuYWJsZTptYXgtbGluZS1sZW5ndGggKi9cblxuLyoqXG4gKiBCdWZmZXJzIHRoZSBzb3VyY2UgT2JzZXJ2YWJsZSB2YWx1ZXMgZm9yIGEgc3BlY2lmaWMgdGltZSBwZXJpb2QuXG4gKlxuICogPHNwYW4gY2xhc3M9XCJpbmZvcm1hbFwiPkNvbGxlY3RzIHZhbHVlcyBmcm9tIHRoZSBwYXN0IGFzIGFuIGFycmF5LCBhbmQgZW1pdHNcbiAqIHRob3NlIGFycmF5cyBwZXJpb2RpY2FsbHkgaW4gdGltZS48L3NwYW4+XG4gKlxuICogIVtdKGJ1ZmZlclRpbWUucG5nKVxuICpcbiAqIEJ1ZmZlcnMgdmFsdWVzIGZyb20gdGhlIHNvdXJjZSBmb3IgYSBzcGVjaWZpYyB0aW1lIGR1cmF0aW9uIGBidWZmZXJUaW1lU3BhbmAuXG4gKiBVbmxlc3MgdGhlIG9wdGlvbmFsIGFyZ3VtZW50IGBidWZmZXJDcmVhdGlvbkludGVydmFsYCBpcyBnaXZlbiwgaXQgZW1pdHMgYW5kXG4gKiByZXNldHMgdGhlIGJ1ZmZlciBldmVyeSBgYnVmZmVyVGltZVNwYW5gIG1pbGxpc2Vjb25kcy4gSWZcbiAqIGBidWZmZXJDcmVhdGlvbkludGVydmFsYCBpcyBnaXZlbiwgdGhpcyBvcGVyYXRvciBvcGVucyB0aGUgYnVmZmVyIGV2ZXJ5XG4gKiBgYnVmZmVyQ3JlYXRpb25JbnRlcnZhbGAgbWlsbGlzZWNvbmRzIGFuZCBjbG9zZXMgKGVtaXRzIGFuZCByZXNldHMpIHRoZVxuICogYnVmZmVyIGV2ZXJ5IGBidWZmZXJUaW1lU3BhbmAgbWlsbGlzZWNvbmRzLiBXaGVuIHRoZSBvcHRpb25hbCBhcmd1bWVudFxuICogYG1heEJ1ZmZlclNpemVgIGlzIHNwZWNpZmllZCwgdGhlIGJ1ZmZlciB3aWxsIGJlIGNsb3NlZCBlaXRoZXIgYWZ0ZXJcbiAqIGBidWZmZXJUaW1lU3BhbmAgbWlsbGlzZWNvbmRzIG9yIHdoZW4gaXQgY29udGFpbnMgYG1heEJ1ZmZlclNpemVgIGVsZW1lbnRzLlxuICpcbiAqICMjIEV4YW1wbGVzXG4gKlxuICogRXZlcnkgc2Vjb25kLCBlbWl0IGFuIGFycmF5IG9mIHRoZSByZWNlbnQgY2xpY2sgZXZlbnRzXG4gKlxuICogYGBgamF2YXNjcmlwdFxuICogY29uc3QgY2xpY2tzID0gZnJvbUV2ZW50KGRvY3VtZW50LCAnY2xpY2snKTtcbiAqIGNvbnN0IGJ1ZmZlcmVkID0gY2xpY2tzLnBpcGUoYnVmZmVyVGltZSgxMDAwKSk7XG4gKiBidWZmZXJlZC5zdWJzY3JpYmUoeCA9PiBjb25zb2xlLmxvZyh4KSk7XG4gKiBgYGBcbiAqXG4gKiBFdmVyeSA1IHNlY29uZHMsIGVtaXQgdGhlIGNsaWNrIGV2ZW50cyBmcm9tIHRoZSBuZXh0IDIgc2Vjb25kc1xuICpcbiAqIGBgYGphdmFzY3JpcHRcbiAqIGNvbnN0IGNsaWNrcyA9IGZyb21FdmVudChkb2N1bWVudCwgJ2NsaWNrJyk7XG4gKiBjb25zdCBidWZmZXJlZCA9IGNsaWNrcy5waXBlKGJ1ZmZlclRpbWUoMjAwMCwgNTAwMCkpO1xuICogYnVmZmVyZWQuc3Vic2NyaWJlKHggPT4gY29uc29sZS5sb2coeCkpO1xuICogYGBgXG4gKlxuICogQHNlZSB7QGxpbmsgYnVmZmVyfVxuICogQHNlZSB7QGxpbmsgYnVmZmVyQ291bnR9XG4gKiBAc2VlIHtAbGluayBidWZmZXJUb2dnbGV9XG4gKiBAc2VlIHtAbGluayBidWZmZXJXaGVufVxuICogQHNlZSB7QGxpbmsgd2luZG93VGltZX1cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gYnVmZmVyVGltZVNwYW4gVGhlIGFtb3VudCBvZiB0aW1lIHRvIGZpbGwgZWFjaCBidWZmZXIgYXJyYXkuXG4gKiBAcGFyYW0ge251bWJlcn0gW2J1ZmZlckNyZWF0aW9uSW50ZXJ2YWxdIFRoZSBpbnRlcnZhbCBhdCB3aGljaCB0byBzdGFydCBuZXdcbiAqIGJ1ZmZlcnMuXG4gKiBAcGFyYW0ge251bWJlcn0gW21heEJ1ZmZlclNpemVdIFRoZSBtYXhpbXVtIGJ1ZmZlciBzaXplLlxuICogQHBhcmFtIHtTY2hlZHVsZXJMaWtlfSBbc2NoZWR1bGVyPWFzeW5jXSBUaGUgc2NoZWR1bGVyIG9uIHdoaWNoIHRvIHNjaGVkdWxlIHRoZVxuICogaW50ZXJ2YWxzIHRoYXQgZGV0ZXJtaW5lIGJ1ZmZlciBib3VuZGFyaWVzLlxuICogQHJldHVybiB7T2JzZXJ2YWJsZTxUW10+fSBBbiBvYnNlcnZhYmxlIG9mIGFycmF5cyBvZiBidWZmZXJlZCB2YWx1ZXMuXG4gKiBAbWV0aG9kIGJ1ZmZlclRpbWVcbiAqIEBvd25lciBPYnNlcnZhYmxlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWZmZXJUaW1lPFQ+KGJ1ZmZlclRpbWVTcGFuOiBudW1iZXIpOiBPcGVyYXRvckZ1bmN0aW9uPFQsIFRbXT4ge1xuICBsZXQgbGVuZ3RoOiBudW1iZXIgPSBhcmd1bWVudHMubGVuZ3RoO1xuXG4gIGxldCBzY2hlZHVsZXI6IFNjaGVkdWxlckxpa2UgPSBhc3luYztcbiAgaWYgKGlzU2NoZWR1bGVyKGFyZ3VtZW50c1thcmd1bWVudHMubGVuZ3RoIC0gMV0pKSB7XG4gICAgc2NoZWR1bGVyID0gYXJndW1lbnRzW2FyZ3VtZW50cy5sZW5ndGggLSAxXTtcbiAgICBsZW5ndGgtLTtcbiAgfVxuXG4gIGxldCBidWZmZXJDcmVhdGlvbkludGVydmFsOiBudW1iZXIgPSBudWxsO1xuICBpZiAobGVuZ3RoID49IDIpIHtcbiAgICBidWZmZXJDcmVhdGlvbkludGVydmFsID0gYXJndW1lbnRzWzFdO1xuICB9XG5cbiAgbGV0IG1heEJ1ZmZlclNpemU6IG51bWJlciA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgaWYgKGxlbmd0aCA+PSAzKSB7XG4gICAgbWF4QnVmZmVyU2l6ZSA9IGFyZ3VtZW50c1syXTtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiBidWZmZXJUaW1lT3BlcmF0b3JGdW5jdGlvbihzb3VyY2U6IE9ic2VydmFibGU8VD4pIHtcbiAgICByZXR1cm4gc291cmNlLmxpZnQobmV3IEJ1ZmZlclRpbWVPcGVyYXRvcjxUPihidWZmZXJUaW1lU3BhbiwgYnVmZmVyQ3JlYXRpb25JbnRlcnZhbCwgbWF4QnVmZmVyU2l6ZSwgc2NoZWR1bGVyKSk7XG4gIH07XG59XG5cbmNsYXNzIEJ1ZmZlclRpbWVPcGVyYXRvcjxUPiBpbXBsZW1lbnRzIE9wZXJhdG9yPFQsIFRbXT4ge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGJ1ZmZlclRpbWVTcGFuOiBudW1iZXIsXG4gICAgICAgICAgICAgIHByaXZhdGUgYnVmZmVyQ3JlYXRpb25JbnRlcnZhbDogbnVtYmVyLFxuICAgICAgICAgICAgICBwcml2YXRlIG1heEJ1ZmZlclNpemU6IG51bWJlcixcbiAgICAgICAgICAgICAgcHJpdmF0ZSBzY2hlZHVsZXI6IFNjaGVkdWxlckxpa2UpIHtcbiAgfVxuXG4gIGNhbGwoc3Vic2NyaWJlcjogU3Vic2NyaWJlcjxUW10+LCBzb3VyY2U6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHNvdXJjZS5zdWJzY3JpYmUobmV3IEJ1ZmZlclRpbWVTdWJzY3JpYmVyKFxuICAgICAgc3Vic2NyaWJlciwgdGhpcy5idWZmZXJUaW1lU3BhbiwgdGhpcy5idWZmZXJDcmVhdGlvbkludGVydmFsLCB0aGlzLm1heEJ1ZmZlclNpemUsIHRoaXMuc2NoZWR1bGVyXG4gICAgKSk7XG4gIH1cbn1cblxuY2xhc3MgQ29udGV4dDxUPiB7XG4gIGJ1ZmZlcjogVFtdID0gW107XG4gIGNsb3NlQWN0aW9uOiBTdWJzY3JpcHRpb247XG59XG5cbmludGVyZmFjZSBEaXNwYXRjaENyZWF0ZUFyZzxUPiB7XG4gIGJ1ZmZlclRpbWVTcGFuOiBudW1iZXI7XG4gIGJ1ZmZlckNyZWF0aW9uSW50ZXJ2YWw6IG51bWJlcjtcbiAgc3Vic2NyaWJlcjogQnVmZmVyVGltZVN1YnNjcmliZXI8VD47XG4gIHNjaGVkdWxlcjogU2NoZWR1bGVyTGlrZTtcbn1cblxuaW50ZXJmYWNlIERpc3BhdGNoQ2xvc2VBcmc8VD4ge1xuICBzdWJzY3JpYmVyOiBCdWZmZXJUaW1lU3Vic2NyaWJlcjxUPjtcbiAgY29udGV4dDogQ29udGV4dDxUPjtcbn1cblxuLyoqXG4gKiBXZSBuZWVkIHRoaXMgSlNEb2MgY29tbWVudCBmb3IgYWZmZWN0aW5nIEVTRG9jLlxuICogQGlnbm9yZVxuICogQGV4dGVuZHMge0lnbm9yZWR9XG4gKi9cbmNsYXNzIEJ1ZmZlclRpbWVTdWJzY3JpYmVyPFQ+IGV4dGVuZHMgU3Vic2NyaWJlcjxUPiB7XG4gIHByaXZhdGUgY29udGV4dHM6IEFycmF5PENvbnRleHQ8VD4+ID0gW107XG4gIHByaXZhdGUgdGltZXNwYW5Pbmx5OiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKGRlc3RpbmF0aW9uOiBTdWJzY3JpYmVyPFRbXT4sXG4gICAgICAgICAgICAgIHByaXZhdGUgYnVmZmVyVGltZVNwYW46IG51bWJlcixcbiAgICAgICAgICAgICAgcHJpdmF0ZSBidWZmZXJDcmVhdGlvbkludGVydmFsOiBudW1iZXIsXG4gICAgICAgICAgICAgIHByaXZhdGUgbWF4QnVmZmVyU2l6ZTogbnVtYmVyLFxuICAgICAgICAgICAgICBwcml2YXRlIHNjaGVkdWxlcjogU2NoZWR1bGVyTGlrZSkge1xuICAgIHN1cGVyKGRlc3RpbmF0aW9uKTtcbiAgICBjb25zdCBjb250ZXh0ID0gdGhpcy5vcGVuQ29udGV4dCgpO1xuICAgIHRoaXMudGltZXNwYW5Pbmx5ID0gYnVmZmVyQ3JlYXRpb25JbnRlcnZhbCA9PSBudWxsIHx8IGJ1ZmZlckNyZWF0aW9uSW50ZXJ2YWwgPCAwO1xuICAgIGlmICh0aGlzLnRpbWVzcGFuT25seSkge1xuICAgICAgY29uc3QgdGltZVNwYW5Pbmx5U3RhdGUgPSB7IHN1YnNjcmliZXI6IHRoaXMsIGNvbnRleHQsIGJ1ZmZlclRpbWVTcGFuIH07XG4gICAgICB0aGlzLmFkZChjb250ZXh0LmNsb3NlQWN0aW9uID0gc2NoZWR1bGVyLnNjaGVkdWxlKGRpc3BhdGNoQnVmZmVyVGltZVNwYW5Pbmx5LCBidWZmZXJUaW1lU3BhbiwgdGltZVNwYW5Pbmx5U3RhdGUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgY2xvc2VTdGF0ZSA9IHsgc3Vic2NyaWJlcjogdGhpcywgY29udGV4dCB9O1xuICAgICAgY29uc3QgY3JlYXRpb25TdGF0ZTogRGlzcGF0Y2hDcmVhdGVBcmc8VD4gPSB7IGJ1ZmZlclRpbWVTcGFuLCBidWZmZXJDcmVhdGlvbkludGVydmFsLCBzdWJzY3JpYmVyOiB0aGlzLCBzY2hlZHVsZXIgfTtcbiAgICAgIHRoaXMuYWRkKGNvbnRleHQuY2xvc2VBY3Rpb24gPSBzY2hlZHVsZXIuc2NoZWR1bGU8RGlzcGF0Y2hDbG9zZUFyZzxUPj4oZGlzcGF0Y2hCdWZmZXJDbG9zZSwgYnVmZmVyVGltZVNwYW4sIGNsb3NlU3RhdGUpKTtcbiAgICAgIHRoaXMuYWRkKHNjaGVkdWxlci5zY2hlZHVsZTxEaXNwYXRjaENyZWF0ZUFyZzxUPj4oZGlzcGF0Y2hCdWZmZXJDcmVhdGlvbiwgYnVmZmVyQ3JlYXRpb25JbnRlcnZhbCwgY3JlYXRpb25TdGF0ZSkpO1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBfbmV4dCh2YWx1ZTogVCkge1xuICAgIGNvbnN0IGNvbnRleHRzID0gdGhpcy5jb250ZXh0cztcbiAgICBjb25zdCBsZW4gPSBjb250ZXh0cy5sZW5ndGg7XG4gICAgbGV0IGZpbGxlZEJ1ZmZlckNvbnRleHQ6IENvbnRleHQ8VD47XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgY29uc3QgY29udGV4dCA9IGNvbnRleHRzW2ldO1xuICAgICAgY29uc3QgYnVmZmVyID0gY29udGV4dC5idWZmZXI7XG4gICAgICBidWZmZXIucHVzaCh2YWx1ZSk7XG4gICAgICBpZiAoYnVmZmVyLmxlbmd0aCA9PSB0aGlzLm1heEJ1ZmZlclNpemUpIHtcbiAgICAgICAgZmlsbGVkQnVmZmVyQ29udGV4dCA9IGNvbnRleHQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGZpbGxlZEJ1ZmZlckNvbnRleHQpIHtcbiAgICAgIHRoaXMub25CdWZmZXJGdWxsKGZpbGxlZEJ1ZmZlckNvbnRleHQpO1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBfZXJyb3IoZXJyOiBhbnkpIHtcbiAgICB0aGlzLmNvbnRleHRzLmxlbmd0aCA9IDA7XG4gICAgc3VwZXIuX2Vycm9yKGVycik7XG4gIH1cblxuICBwcm90ZWN0ZWQgX2NvbXBsZXRlKCkge1xuICAgIGNvbnN0IHsgY29udGV4dHMsIGRlc3RpbmF0aW9uIH0gPSB0aGlzO1xuICAgIHdoaWxlIChjb250ZXh0cy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gY29udGV4dHMuc2hpZnQoKTtcbiAgICAgIGRlc3RpbmF0aW9uLm5leHQoY29udGV4dC5idWZmZXIpO1xuICAgIH1cbiAgICBzdXBlci5fY29tcGxldGUoKTtcbiAgfVxuXG4gIC8qKiBAZGVwcmVjYXRlZCBUaGlzIGlzIGFuIGludGVybmFsIGltcGxlbWVudGF0aW9uIGRldGFpbCwgZG8gbm90IHVzZS4gKi9cbiAgX3Vuc3Vic2NyaWJlKCkge1xuICAgIHRoaXMuY29udGV4dHMgPSBudWxsO1xuICB9XG5cbiAgcHJvdGVjdGVkIG9uQnVmZmVyRnVsbChjb250ZXh0OiBDb250ZXh0PFQ+KSB7XG4gICAgdGhpcy5jbG9zZUNvbnRleHQoY29udGV4dCk7XG4gICAgY29uc3QgY2xvc2VBY3Rpb24gPSBjb250ZXh0LmNsb3NlQWN0aW9uO1xuICAgIGNsb3NlQWN0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5yZW1vdmUoY2xvc2VBY3Rpb24pO1xuXG4gICAgaWYgKCF0aGlzLmNsb3NlZCAmJiB0aGlzLnRpbWVzcGFuT25seSkge1xuICAgICAgY29udGV4dCA9IHRoaXMub3BlbkNvbnRleHQoKTtcbiAgICAgIGNvbnN0IGJ1ZmZlclRpbWVTcGFuID0gdGhpcy5idWZmZXJUaW1lU3BhbjtcbiAgICAgIGNvbnN0IHRpbWVTcGFuT25seVN0YXRlID0geyBzdWJzY3JpYmVyOiB0aGlzLCBjb250ZXh0LCBidWZmZXJUaW1lU3BhbiB9O1xuICAgICAgdGhpcy5hZGQoY29udGV4dC5jbG9zZUFjdGlvbiA9IHRoaXMuc2NoZWR1bGVyLnNjaGVkdWxlKGRpc3BhdGNoQnVmZmVyVGltZVNwYW5Pbmx5LCBidWZmZXJUaW1lU3BhbiwgdGltZVNwYW5Pbmx5U3RhdGUpKTtcbiAgICB9XG4gIH1cblxuICBvcGVuQ29udGV4dCgpOiBDb250ZXh0PFQ+IHtcbiAgICBjb25zdCBjb250ZXh0OiBDb250ZXh0PFQ+ID0gbmV3IENvbnRleHQ8VD4oKTtcbiAgICB0aGlzLmNvbnRleHRzLnB1c2goY29udGV4dCk7XG4gICAgcmV0dXJuIGNvbnRleHQ7XG4gIH1cblxuICBjbG9zZUNvbnRleHQoY29udGV4dDogQ29udGV4dDxUPikge1xuICAgIHRoaXMuZGVzdGluYXRpb24ubmV4dChjb250ZXh0LmJ1ZmZlcik7XG4gICAgY29uc3QgY29udGV4dHMgPSB0aGlzLmNvbnRleHRzO1xuXG4gICAgY29uc3Qgc3BsaWNlSW5kZXggPSBjb250ZXh0cyA/IGNvbnRleHRzLmluZGV4T2YoY29udGV4dCkgOiAtMTtcbiAgICBpZiAoc3BsaWNlSW5kZXggPj0gMCkge1xuICAgICAgY29udGV4dHMuc3BsaWNlKGNvbnRleHRzLmluZGV4T2YoY29udGV4dCksIDEpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBkaXNwYXRjaEJ1ZmZlclRpbWVTcGFuT25seSh0aGlzOiBTY2hlZHVsZXJBY3Rpb248YW55Piwgc3RhdGU6IGFueSkge1xuICBjb25zdCBzdWJzY3JpYmVyOiBCdWZmZXJUaW1lU3Vic2NyaWJlcjxhbnk+ID0gc3RhdGUuc3Vic2NyaWJlcjtcblxuICBjb25zdCBwcmV2Q29udGV4dCA9IHN0YXRlLmNvbnRleHQ7XG4gIGlmIChwcmV2Q29udGV4dCkge1xuICAgIHN1YnNjcmliZXIuY2xvc2VDb250ZXh0KHByZXZDb250ZXh0KTtcbiAgfVxuXG4gIGlmICghc3Vic2NyaWJlci5jbG9zZWQpIHtcbiAgICBzdGF0ZS5jb250ZXh0ID0gc3Vic2NyaWJlci5vcGVuQ29udGV4dCgpO1xuICAgIHN0YXRlLmNvbnRleHQuY2xvc2VBY3Rpb24gPSB0aGlzLnNjaGVkdWxlKHN0YXRlLCBzdGF0ZS5idWZmZXJUaW1lU3Bhbik7XG4gIH1cbn1cblxuZnVuY3Rpb24gZGlzcGF0Y2hCdWZmZXJDcmVhdGlvbjxUPih0aGlzOiBTY2hlZHVsZXJBY3Rpb248RGlzcGF0Y2hDcmVhdGVBcmc8VD4+LCBzdGF0ZTogRGlzcGF0Y2hDcmVhdGVBcmc8VD4pIHtcbiAgY29uc3QgeyBidWZmZXJDcmVhdGlvbkludGVydmFsLCBidWZmZXJUaW1lU3Bhbiwgc3Vic2NyaWJlciwgc2NoZWR1bGVyIH0gPSBzdGF0ZTtcbiAgY29uc3QgY29udGV4dCA9IHN1YnNjcmliZXIub3BlbkNvbnRleHQoKTtcbiAgY29uc3QgYWN0aW9uID0gPFNjaGVkdWxlckFjdGlvbjxEaXNwYXRjaENyZWF0ZUFyZzxUPj4+dGhpcztcbiAgaWYgKCFzdWJzY3JpYmVyLmNsb3NlZCkge1xuICAgIHN1YnNjcmliZXIuYWRkKGNvbnRleHQuY2xvc2VBY3Rpb24gPSBzY2hlZHVsZXIuc2NoZWR1bGU8RGlzcGF0Y2hDbG9zZUFyZzxUPj4oZGlzcGF0Y2hCdWZmZXJDbG9zZSwgYnVmZmVyVGltZVNwYW4sIHsgc3Vic2NyaWJlciwgY29udGV4dCB9KSk7XG4gICAgYWN0aW9uLnNjaGVkdWxlKHN0YXRlLCBidWZmZXJDcmVhdGlvbkludGVydmFsKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBkaXNwYXRjaEJ1ZmZlckNsb3NlPFQ+KGFyZzogRGlzcGF0Y2hDbG9zZUFyZzxUPikge1xuICBjb25zdCB7IHN1YnNjcmliZXIsIGNvbnRleHQgfSA9IGFyZztcbiAgc3Vic2NyaWJlci5jbG9zZUNvbnRleHQoY29udGV4dCk7XG59XG4iXX0=