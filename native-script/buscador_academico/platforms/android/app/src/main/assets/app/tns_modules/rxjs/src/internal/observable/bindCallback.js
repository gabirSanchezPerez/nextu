"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("../Observable");
var AsyncSubject_1 = require("../AsyncSubject");
var map_1 = require("../operators/map");
var canReportError_1 = require("../util/canReportError");
var isArray_1 = require("../util/isArray");
var isScheduler_1 = require("../util/isScheduler");
// tslint:enable:max-line-length
/**
 * Converts a callback API to a function that returns an Observable.
 *
 * <span class="informal">Give it a function `f` of type `f(x, callback)` and
 * it will return a function `g` that when called as `g(x)` will output an
 * Observable.</span>
 *
 * `bindCallback` is not an operator because its input and output are not
 * Observables. The input is a function `func` with some parameters. The
 * last parameter must be a callback function that `func` calls when it is
 * done.
 *
 * The output of `bindCallback` is a function that takes the same parameters
 * as `func`, except the last one (the callback). When the output function
 * is called with arguments it will return an Observable. If function `func`
 * calls its callback with one argument, the Observable will emit that value.
 * If on the other hand the callback is called with multiple values the resulting
 * Observable will emit an array with said values as arguments.
 *
 * It is **very important** to remember that input function `func` is not called
 * when the output function is, but rather when the Observable returned by the output
 * function is subscribed. This means if `func` makes an AJAX request, that request
 * will be made every time someone subscribes to the resulting Observable, but not before.
 *
 * The last optional parameter - `scheduler` - can be used to control when the call
 * to `func` happens after someone subscribes to Observable, as well as when results
 * passed to callback will be emitted. By default, the subscription to an Observable calls `func`
 * synchronously, but using {@link asyncScheduler} as the last parameter will defer the call to `func`,
 * just like wrapping the call in `setTimeout` with a timeout of `0` would. If you were to use the async Scheduler
 * and call `subscribe` on the output Observable, all function calls that are currently executing
 * will end before `func` is invoked.
 *
 * By default, results passed to the callback are emitted immediately after `func` invokes the callback.
 * In particular, if the callback is called synchronously, then the subscription of the resulting Observable
 * will call the `next` function synchronously as well.  If you want to defer that call,
 * you may use {@link asyncScheduler} just as before.  This means that by using `Scheduler.async` you can
 * ensure that `func` always calls its callback asynchronously, thus avoiding terrifying Zalgo.
 *
 * Note that the Observable created by the output function will always emit a single value
 * and then complete immediately. If `func` calls the callback multiple times, values from subsequent
 * calls will not appear in the stream. If you need to listen for multiple calls,
 *  you probably want to use {@link fromEvent} or {@link fromEventPattern} instead.
 *
 * If `func` depends on some context (`this` property) and is not already bound, the context of `func`
 * will be the context that the output function has at call time. In particular, if `func`
 * is called as a method of some objec and if `func` is not already bound, in order to preserve the context
 * it is recommended that the context of the output function is set to that object as well.
 *
 * If the input function calls its callback in the "node style" (i.e. first argument to callback is
 * optional error parameter signaling whether the call failed or not), {@link bindNodeCallback}
 * provides convenient error handling and probably is a better choice.
 * `bindCallback` will treat such functions the same as any other and error parameters
 * (whether passed or not) will always be interpreted as regular callback argument.
 *
 * ## Examples
 *
 * ### Convert jQuery's getJSON to an Observable API
 * ```javascript
 * // Suppose we have jQuery.getJSON('/my/url', callback)
 * const getJSONAsObservable = bindCallback(jQuery.getJSON);
 * const result = getJSONAsObservable('/my/url');
 * result.subscribe(x => console.log(x), e => console.error(e));
 * ```
 *
 * ### Receive an array of arguments passed to a callback
 * ```javascript
 * someFunction((a, b, c) => {
 *   console.log(a); // 5
 *   console.log(b); // 'some string'
 *   console.log(c); // {someProperty: 'someValue'}
 * });
 *
 * const boundSomeFunction = bindCallback(someFunction);
 * boundSomeFunction().subscribe(values => {
 *   console.log(values) // [5, 'some string', {someProperty: 'someValue'}]
 * });
 * ```
 *
 * ### Compare behaviour with and without async Scheduler
 * ```javascript
 * function iCallMyCallbackSynchronously(cb) {
 *   cb();
 * }
 *
 * const boundSyncFn = bindCallback(iCallMyCallbackSynchronously);
 * const boundAsyncFn = bindCallback(iCallMyCallbackSynchronously, null, Rx.Scheduler.async);
 *
 * boundSyncFn().subscribe(() => console.log('I was sync!'));
 * boundAsyncFn().subscribe(() => console.log('I was async!'));
 * console.log('This happened...');
 *
 * // Logs:
 * // I was sync!
 * // This happened...
 * // I was async!
 * ```
 *
 * ### Use bindCallback on an object method
 * ```javascript
 * const boundMethod = bindCallback(someObject.methodWithCallback);
 * boundMethod.call(someObject) // make sure methodWithCallback has access to someObject
 * .subscribe(subscriber);
 * ```
 *
 * @see {@link bindNodeCallback}
 * @see {@link from}
 *
 * @param {function} func A function with a callback as the last parameter.
 * @param {SchedulerLike} [scheduler] The scheduler on which to schedule the
 * callbacks.
 * @return {function(...params: *): Observable} A function which returns the
 * Observable that delivers the same values the callback would deliver.
 * @name bindCallback
 */
function bindCallback(callbackFunc, resultSelector, scheduler) {
    if (resultSelector) {
        if (isScheduler_1.isScheduler(resultSelector)) {
            scheduler = resultSelector;
        }
        else {
            // DEPRECATED PATH
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return bindCallback(callbackFunc, scheduler).apply(void 0, args).pipe(map_1.map(function (args) { return isArray_1.isArray(args) ? resultSelector.apply(void 0, args) : resultSelector(args); }));
            };
        }
    }
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var context = this;
        var subject;
        var params = {
            context: context,
            subject: subject,
            callbackFunc: callbackFunc,
            scheduler: scheduler,
        };
        return new Observable_1.Observable(function (subscriber) {
            if (!scheduler) {
                if (!subject) {
                    subject = new AsyncSubject_1.AsyncSubject();
                    var handler = function () {
                        var innerArgs = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            innerArgs[_i] = arguments[_i];
                        }
                        subject.next(innerArgs.length <= 1 ? innerArgs[0] : innerArgs);
                        subject.complete();
                    };
                    try {
                        callbackFunc.apply(context, args.concat([handler]));
                    }
                    catch (err) {
                        if (canReportError_1.canReportError(subject)) {
                            subject.error(err);
                        }
                        else {
                            console.warn(err);
                        }
                    }
                }
                return subject.subscribe(subscriber);
            }
            else {
                var state = {
                    args: args, subscriber: subscriber, params: params,
                };
                return scheduler.schedule(dispatch, 0, state);
            }
        });
    };
}
exports.bindCallback = bindCallback;
function dispatch(state) {
    var _this = this;
    var self = this;
    var args = state.args, subscriber = state.subscriber, params = state.params;
    var callbackFunc = params.callbackFunc, context = params.context, scheduler = params.scheduler;
    var subject = params.subject;
    if (!subject) {
        subject = params.subject = new AsyncSubject_1.AsyncSubject();
        var handler = function () {
            var innerArgs = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                innerArgs[_i] = arguments[_i];
            }
            var value = innerArgs.length <= 1 ? innerArgs[0] : innerArgs;
            _this.add(scheduler.schedule(dispatchNext, 0, { value: value, subject: subject }));
        };
        try {
            callbackFunc.apply(context, args.concat([handler]));
        }
        catch (err) {
            subject.error(err);
        }
    }
    this.add(subject.subscribe(subscriber));
}
function dispatchNext(state) {
    var value = state.value, subject = state.subject;
    subject.next(value);
    subject.complete();
}
function dispatchError(state) {
    var err = state.err, subject = state.subject;
    subject.error(err);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmluZENhbGxiYWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYmluZENhbGxiYWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsNENBQTJDO0FBQzNDLGdEQUErQztBQUUvQyx3Q0FBdUM7QUFDdkMseURBQXdEO0FBQ3hELDJDQUEwQztBQUMxQyxtREFBa0Q7QUErQ2xELGdDQUFnQztBQUVoQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FpSEc7QUFDSCxTQUFnQixZQUFZLENBQzFCLFlBQXNCLEVBQ3RCLGNBQXVDLEVBQ3ZDLFNBQXlCO0lBRXpCLElBQUksY0FBYyxFQUFFO1FBQ2xCLElBQUkseUJBQVcsQ0FBQyxjQUFjLENBQUMsRUFBRTtZQUMvQixTQUFTLEdBQUcsY0FBYyxDQUFDO1NBQzVCO2FBQU07WUFDTCxrQkFBa0I7WUFDbEIsT0FBTztnQkFBQyxjQUFjO3FCQUFkLFVBQWMsRUFBZCxxQkFBYyxFQUFkLElBQWM7b0JBQWQseUJBQWM7O2dCQUFLLE9BQUEsWUFBWSxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsZUFBSSxJQUFJLEVBQUUsSUFBSSxDQUM1RSxTQUFHLENBQUMsVUFBQyxJQUFJLElBQUssT0FBQSxpQkFBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLGVBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQTlELENBQThELENBQUMsQ0FDOUU7WUFGMEIsQ0FFMUIsQ0FBQztTQUNIO0tBQ0Y7SUFFRCxPQUFPO1FBQXFCLGNBQWM7YUFBZCxVQUFjLEVBQWQscUJBQWMsRUFBZCxJQUFjO1lBQWQseUJBQWM7O1FBQ3hDLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQztRQUNyQixJQUFJLE9BQXdCLENBQUM7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O0FBT0QsU0FBUyxZQUFZLENBQXlDLEtBQW1CO0lBQ3ZFLElBQUEsbUJBQUssRUFBRSx1QkFBTyxDQUFXO0lBQ2pDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDcEIsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ3JCLENBQUM7QUFPRCxTQUFTLGFBQWEsQ0FBMEMsS0FBb0I7SUFDMUUsSUFBQSxlQUFHLEVBQUUsdUJBQU8sQ0FBVztJQUMvQixPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3JCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTY2hlZHVsZXJMaWtlLCBTY2hlZHVsZXJBY3Rpb24gfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAnLi4vT2JzZXJ2YWJsZSc7XG5pbXBvcnQgeyBBc3luY1N1YmplY3QgfSBmcm9tICcuLi9Bc3luY1N1YmplY3QnO1xuaW1wb3J0IHsgU3Vic2NyaWJlciB9IGZyb20gJy4uL1N1YnNjcmliZXInO1xuaW1wb3J0IHsgbWFwIH0gZnJvbSAnLi4vb3BlcmF0b3JzL21hcCc7XG5pbXBvcnQgeyBjYW5SZXBvcnRFcnJvciB9IGZyb20gJy4uL3V0aWwvY2FuUmVwb3J0RXJyb3InO1xuaW1wb3J0IHsgaXNBcnJheSB9IGZyb20gJy4uL3V0aWwvaXNBcnJheSc7XG5pbXBvcnQgeyBpc1NjaGVkdWxlciB9IGZyb20gJy4uL3V0aWwvaXNTY2hlZHVsZXInO1xuXG4vLyB0c2xpbnQ6ZGlzYWJsZTptYXgtbGluZS1sZW5ndGhcbi8qKiBAZGVwcmVjYXRlZCByZXN1bHRTZWxlY3RvciBpcyBubyBsb25nZXIgc3VwcG9ydGVkLCB1c2UgYSBtYXBwaW5nIGZ1bmN0aW9uLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmRDYWxsYmFjayhjYWxsYmFja0Z1bmM6IEZ1bmN0aW9uLCByZXN1bHRTZWxlY3RvcjogRnVuY3Rpb24sIHNjaGVkdWxlcj86IFNjaGVkdWxlckxpa2UpOiAoLi4uYXJnczogYW55W10pID0+IE9ic2VydmFibGU8YW55PjtcblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmRDYWxsYmFjazxSMSwgUjIsIFIzLCBSND4oY2FsbGJhY2tGdW5jOiAoY2FsbGJhY2s6IChyZXMxOiBSMSwgcmVzMjogUjIsIHJlczM6IFIzLCByZXM0OiBSNCwgLi4uYXJnczogYW55W10pID0+IGFueSkgPT4gYW55LCBzY2hlZHVsZXI/OiBTY2hlZHVsZXJMaWtlKTogKCkgPT4gT2JzZXJ2YWJsZTxhbnlbXT47XG5leHBvcnQgZnVuY3Rpb24gYmluZENhbGxiYWNrPFIxLCBSMiwgUjM+KGNhbGxiYWNrRnVuYzogKGNhbGxiYWNrOiAocmVzMTogUjEsIHJlczI6IFIyLCByZXMzOiBSMykgPT4gYW55KSA9PiBhbnksIHNjaGVkdWxlcj86IFNjaGVkdWxlckxpa2UpOiAoKSA9PiBPYnNlcnZhYmxlPFtSMSwgUjIsIFIzXT47XG5leHBvcnQgZnVuY3Rpb24gYmluZENhbGxiYWNrPFIxLCBSMj4oY2FsbGJhY2tGdW5jOiAoY2FsbGJhY2s6IChyZXMxOiBSMSwgcmVzMjogUjIpID0+IGFueSkgPT4gYW55LCBzY2hlZHVsZXI/OiBTY2hlZHVsZXJMaWtlKTogKCkgPT4gT2JzZXJ2YWJsZTxbUjEsIFIyXT47XG5leHBvcnQgZnVuY3Rpb24gYmluZENhbGxiYWNrPFIxPihjYWxsYmFja0Z1bmM6IChjYWxsYmFjazogKHJlczE6IFIxKSA9PiBhbnkpID0+IGFueSwgc2NoZWR1bGVyPzogU2NoZWR1bGVyTGlrZSk6ICgpID0+IE9ic2VydmFibGU8UjE+O1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmRDYWxsYmFjayhjYWxsYmFja0Z1bmM6IChjYWxsYmFjazogKCkgPT4gYW55KSA9PiBhbnksIHNjaGVkdWxlcj86IFNjaGVkdWxlckxpa2UpOiAoKSA9PiBPYnNlcnZhYmxlPHZvaWQ+O1xuXG5leHBvcnQgZnVuY3Rpb24gYmluZENhbGxiYWNrPEExLCBSMSwgUjIsIFIzLCBSND4oY2FsbGJhY2tGdW5jOiAoYXJnMTogQTEsIGNhbGxiYWNrOiAocmVzMTogUjEsIHJlczI6IFIyLCByZXMzOiBSMywgcmVzNDogUjQsIC4uLmFyZ3M6IGFueVtdKSA9PiBhbnkpID0+IGFueSwgc2NoZWR1bGVyPzogU2NoZWR1bGVyTGlrZSk6IChhcmcxOiBBMSkgPT4gT2JzZXJ2YWJsZTxhbnlbXT47XG5leHBvcnQgZnVuY3Rpb24gYmluZENhbGxiYWNrPEExLCBSMSwgUjIsIFIzPihjYWxsYmFja0Z1bmM6IChhcmcxOiBBMSwgY2FsbGJhY2s6IChyZXMxOiBSMSwgcmVzMjogUjIsIHJlczM6IFIzKSA9PiBhbnkpID0+IGFueSwgc2NoZWR1bGVyPzogU2NoZWR1bGVyTGlrZSk6IChhcmcxOiBBMSkgPT4gT2JzZXJ2YWJsZTxbUjEsIFIyLCBSM10+O1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmRDYWxsYmFjazxBMSwgUjEsIFIyPihjYWxsYmFja0Z1bmM6IChhcmcxOiBBMSwgY2FsbGJhY2s6IChyZXMxOiBSMSwgcmVzMjogUjIpID0+IGFueSkgPT4gYW55LCBzY2hlZHVsZXI/OiBTY2hlZHVsZXJMaWtlKTogKGFyZzE6IEExKSA9PiBPYnNlcnZhYmxlPFtSMSwgUjJdPjtcbmV4cG9ydCBmdW5jdGlvbiBiaW5kQ2FsbGJhY2s8QTEsIFIxPihjYWxsYmFja0Z1bmM6IChhcmcxOiBBMSwgY2FsbGJhY2s6IChyZXMxOiBSMSkgPT4gYW55KSA9PiBhbnksIHNjaGVkdWxlcj86IFNjaGVkdWxlckxpa2UpOiAoYXJnMTogQTEpID0+IE9ic2VydmFibGU8UjE+O1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmRDYWxsYmFjazxBMT4oY2FsbGJhY2tGdW5jOiAoYXJnMTogQTEsIGNhbGxiYWNrOiAoKSA9PiBhbnkpID0+IGFueSwgc2NoZWR1bGVyPzogU2NoZWR1bGVyTGlrZSk6IChhcmcxOiBBMSkgPT4gT2JzZXJ2YWJsZTx2b2lkPjtcblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmRDYWxsYmFjazxBMSwgQTIsIFIxLCBSMiwgUjMsIFI0PihjYWxsYmFja0Z1bmM6IChhcmcxOiBBMSwgYXJnMjogQTIsIGNhbGxiYWNrOiAocmVzMTogUjEsIHJlczI6IFIyLCByZXMzOiBSMywgcmVzNDogUjQsIC4uLmFyZ3M6IGFueVtdKSA9PiBhbnkpID0+IGFueSwgc2NoZWR1bGVyPzogU2NoZWR1bGVyTGlrZSk6IChhcmcxOiBBMSwgYXJnMjogQTIpID0+IE9ic2VydmFibGU8YW55W10+O1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmRDYWxsYmFjazxBMSwgQTIsIFIxLCBSMiwgUjM+KGNhbGxiYWNrRnVuYzogKGFyZzE6IEExLCBhcmcyOiBBMiwgY2FsbGJhY2s6IChyZXMxOiBSMSwgcmVzMjogUjIsIHJlczM6IFIzKSA9PiBhbnkpID0+IGFueSwgc2NoZWR1bGVyPzogU2NoZWR1bGVyTGlrZSk6IChhcmcxOiBBMSwgYXJnMjogQTIpID0+IE9ic2VydmFibGU8W1IxLCBSMiwgUjNdPjtcbmV4cG9ydCBmdW5jdGlvbiBiaW5kQ2FsbGJhY2s8QTEsIEEyLCBSMSwgUjI+KGNhbGxiYWNrRnVuYzogKGFyZzE6IEExLCBhcmcyOiBBMiwgY2FsbGJhY2s6IChyZXMxOiBSMSwgcmVzMjogUjIpID0+IGFueSkgPT4gYW55LCBzY2hlZHVsZXI/OiBTY2hlZHVsZXJMaWtlKTogKGFyZzE6IEExLCBhcmcyOiBBMikgPT4gT2JzZXJ2YWJsZTxbUjEsIFIyXT47XG5leHBvcnQgZnVuY3Rpb24gYmluZENhbGxiYWNrPEExLCBBMiwgUjE+KGNhbGxiYWNrRnVuYzogKGFyZzE6IEExLCBhcmcyOiBBMiwgY2FsbGJhY2s6IChyZXMxOiBSMSkgPT4gYW55KSA9PiBhbnksIHNjaGVkdWxlcj86IFNjaGVkdWxlckxpa2UpOiAoYXJnMTogQTEsIGFyZzI6IEEyKSA9PiBPYnNlcnZhYmxlPFIxPjtcbmV4cG9ydCBmdW5jdGlvbiBiaW5kQ2FsbGJhY2s8QTEsIEEyPihjYWxsYmFja0Z1bmM6IChhcmcxOiBBMSwgYXJnMjogQTIsIGNhbGxiYWNrOiAoKSA9PiBhbnkpID0+IGFueSwgc2NoZWR1bGVyPzogU2NoZWR1bGVyTGlrZSk6IChhcmcxOiBBMSwgYXJnMjogQTIpID0+IE9ic2VydmFibGU8dm9pZD47XG5cbmV4cG9ydCBmdW5jdGlvbiBiaW5kQ2FsbGJhY2s8QTEsIEEyLCBBMywgUjEsIFIyLCBSMywgUjQ+KGNhbGxiYWNrRnVuYzogKGFyZzE6IEExLCBhcmcyOiBBMiwgYXJnMzogQTMsIGNhbGxiYWNrOiAocmVzMTogUjEsIHJlczI6IFIyLCByZXMzOiBSMywgcmVzNDogUjQsIC4uLmFyZ3M6IGFueVtdKSA9PiBhbnkpID0+IGFueSwgc2NoZWR1bGVyPzogU2NoZWR1bGVyTGlrZSk6IChhcmcxOiBBMSwgYXJnMjogQTIsIGFyZzM6IEEzKSA9PiBPYnNlcnZhYmxlPGFueVtdPjtcbmV4cG9ydCBmdW5jdGlvbiBiaW5kQ2FsbGJhY2s8QTEsIEEyLCBBMywgUjEsIFIyLCBSMz4oY2FsbGJhY2tGdW5jOiAoYXJnMTogQTEsIGFyZzI6IEEyLCBhcmczOiBBMywgY2FsbGJhY2s6IChyZXMxOiBSMSwgcmVzMjogUjIsIHJlczM6IFIzKSA9PiBhbnkpID0+IGFueSwgc2NoZWR1bGVyPzogU2NoZWR1bGVyTGlrZSk6IChhcmcxOiBBMSwgYXJnMjogQTIsIGFyZzM6IEEzKSA9PiBPYnNlcnZhYmxlPFtSMSwgUjIsIFIzXT47XG5leHBvcnQgZnVuY3Rpb24gYmluZENhbGxiYWNrPEExLCBBMiwgQTMsIFIxLCBSMj4oY2FsbGJhY2tGdW5jOiAoYXJnMTogQTEsIGFyZzI6IEEyLCBhcmczOiBBMywgY2FsbGJhY2s6IChyZXMxOiBSMSwgcmVzMjogUjIpID0+IGFueSkgPT4gYW55LCBzY2hlZHVsZXI/OiBTY2hlZHVsZXJMaWtlKTogKGFyZzE6IEExLCBhcmcyOiBBMiwgYXJnMzogQTMpID0+IE9ic2VydmFibGU8W1IxLCBSMl0+O1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmRDYWxsYmFjazxBMSwgQTIsIEEzLCBSMT4oY2FsbGJhY2tGdW5jOiAoYXJnMTogQTEsIGFyZzI6IEEyLCBhcmczOiBBMywgY2FsbGJhY2s6IChyZXMxOiBSMSkgPT4gYW55KSA9PiBhbnksIHNjaGVkdWxlcj86IFNjaGVkdWxlckxpa2UpOiAoYXJnMTogQTEsIGFyZzI6IEEyLCBhcmczOiBBMykgPT4gT2JzZXJ2YWJsZTxSMT47XG5leHBvcnQgZnVuY3Rpb24gYmluZENhbGxiYWNrPEExLCBBMiwgQTM+KGNhbGxiYWNrRnVuYzogKGFyZzE6IEExLCBhcmcyOiBBMiwgYXJnMzogQTMsIGNhbGxiYWNrOiAoKSA9PiBhbnkpID0+IGFueSwgc2NoZWR1bGVyPzogU2NoZWR1bGVyTGlrZSk6IChhcmcxOiBBMSwgYXJnMjogQTIsIGFyZzM6IEEzKSA9PiBPYnNlcnZhYmxlPHZvaWQ+O1xuXG5leHBvcnQgZnVuY3Rpb24gYmluZENhbGxiYWNrPEExLCBBMiwgQTMsIEE0LCBSMSwgUjIsIFIzLCBSND4oY2FsbGJhY2tGdW5jOiAoYXJnMTogQTEsIGFyZzI6IEEyLCBhcmczOiBBMywgYXJnNDogQTQsIGNhbGxiYWNrOiAocmVzMTogUjEsIHJlczI6IFIyLCByZXMzOiBSMywgcmVzNDogUjQsIC4uLmFyZ3M6IGFueVtdKSA9PiBhbnkpID0+IGFueSwgc2NoZWR1bGVyPzogU2NoZWR1bGVyTGlrZSk6IChhcmcxOiBBMSwgYXJnMjogQTIsIGFyZzM6IEEzLCBhcmc0OiBBNCkgPT4gT2JzZXJ2YWJsZTxhbnlbXT47XG5leHBvcnQgZnVuY3Rpb24gYmluZENhbGxiYWNrPEExLCBBMiwgQTMsIEE0LCBSMSwgUjIsIFIzPihjYWxsYmFja0Z1bmM6IChhcmcxOiBBMSwgYXJnMjogQTIsIGFyZzM6IEEzLCBhcmc0OiBBNCwgY2FsbGJhY2s6IChyZXMxOiBSMSwgcmVzMjogUjIsIHJlczM6IFIzKSA9PiBhbnkpID0+IGFueSwgc2NoZWR1bGVyPzogU2NoZWR1bGVyTGlrZSk6IChhcmcxOiBBMSwgYXJnMjogQTIsIGFyZzM6IEEzLCBhcmc0OiBBNCkgPT4gT2JzZXJ2YWJsZTxbUjEsIFIyLCBSM10+O1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmRDYWxsYmFjazxBMSwgQTIsIEEzLCBBNCwgUjEsIFIyPihjYWxsYmFja0Z1bmM6IChhcmcxOiBBMSwgYXJnMjogQTIsIGFyZzM6IEEzLCBhcmc0OiBBNCwgY2FsbGJhY2s6IChyZXMxOiBSMSwgcmVzMjogUjIpID0+IGFueSkgPT4gYW55LCBzY2hlZHVsZXI/OiBTY2hlZHVsZXJMaWtlKTogKGFyZzE6IEExLCBhcmcyOiBBMiwgYXJnMzogQTMsIGFyZzQ6IEE0KSA9PiBPYnNlcnZhYmxlPFtSMSwgUjJdPjtcbmV4cG9ydCBmdW5jdGlvbiBiaW5kQ2FsbGJhY2s8QTEsIEEyLCBBMywgQTQsIFIxPihjYWxsYmFja0Z1bmM6IChhcmcxOiBBMSwgYXJnMjogQTIsIGFyZzM6IEEzLCBhcmc0OiBBNCwgY2FsbGJhY2s6IChyZXMxOiBSMSkgPT4gYW55KSA9PiBhbnksIHNjaGVkdWxlcj86IFNjaGVkdWxlckxpa2UpOiAoYXJnMTogQTEsIGFyZzI6IEEyLCBhcmczOiBBMywgYXJnNDogQTQpID0+IE9ic2VydmFibGU8UjE+O1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmRDYWxsYmFjazxBMSwgQTIsIEEzLCBBND4oY2FsbGJhY2tGdW5jOiAoYXJnMTogQTEsIGFyZzI6IEEyLCBhcmczOiBBMywgYXJnNDogQTQsIGNhbGxiYWNrOiAoKSA9PiBhbnkpID0+IGFueSwgc2NoZWR1bGVyPzogU2NoZWR1bGVyTGlrZSk6IChhcmcxOiBBMSwgYXJnMjogQTIsIGFyZzM6IEEzLCBhcmc0OiBBNCkgPT4gT2JzZXJ2YWJsZTx2b2lkPjtcblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmRDYWxsYmFjazxBMSwgQTIsIEEzLCBBNCwgQTUsIFIxLCBSMiwgUjMsIFI0PihjYWxsYmFja0Z1bmM6IChhcmcxOiBBMSwgYXJnMjogQTIsIGFyZzM6IEEzLCBhcmc0OiBBNCwgYXJnNTogQTUsIGNhbGxiYWNrOiAocmVzMTogUjEsIHJlczI6IFIyLCByZXMzOiBSMywgcmVzNDogUjQsIC4uLmFyZ3M6IGFueVtdKSA9PiBhbnkpID0+IGFueSwgc2NoZWR1bGVyPzogU2NoZWR1bGVyTGlrZSk6IChhcmcxOiBBMSwgYXJnMjogQTIsIGFyZzM6IEEzLCBhcmc0OiBBNCwgYXJnNTogQTUpID0+IE9ic2VydmFibGU8YW55W10+O1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmRDYWxsYmFjazxBMSwgQTIsIEEzLCBBNCwgQTUsIFIxLCBSMiwgUjM+KGNhbGxiYWNrRnVuYzogKGFyZzE6IEExLCBhcmcyOiBBMiwgYXJnMzogQTMsIGFyZzQ6IEE0LCBhcmc1OiBBNSwgY2FsbGJhY2s6IChyZXMxOiBSMSwgcmVzMjogUjIsIHJlczM6IFIzKSA9PiBhbnkpID0+IGFueSwgc2NoZWR1bGVyPzogU2NoZWR1bGVyTGlrZSk6IChhcmcxOiBBMSwgYXJnMjogQTIsIGFyZzM6IEEzLCBhcmc0OiBBNCwgYXJnNTogQTUpID0+IE9ic2VydmFibGU8W1IxLCBSMiwgUjNdPjtcbmV4cG9ydCBmdW5jdGlvbiBiaW5kQ2FsbGJhY2s8QTEsIEEyLCBBMywgQTQsIEE1LCBSMSwgUjI+KGNhbGxiYWNrRnVuYzogKGFyZzE6IEExLCBhcmcyOiBBMiwgYXJnMzogQTMsIGFyZzQ6IEE0LCBhcmc1OiBBNSwgY2FsbGJhY2s6IChyZXMxOiBSMSwgcmVzMjogUjIpID0+IGFueSkgPT4gYW55LCBzY2hlZHVsZXI/OiBTY2hlZHVsZXJMaWtlKTogKGFyZzE6IEExLCBhcmcyOiBBMiwgYXJnMzogQTMsIGFyZzQ6IEE0LCBhcmc1OiBBNSkgPT4gT2JzZXJ2YWJsZTxbUjEsIFIyXT47XG5leHBvcnQgZnVuY3Rpb24gYmluZENhbGxiYWNrPEExLCBBMiwgQTMsIEE0LCBBNSwgUjE+KGNhbGxiYWNrRnVuYzogKGFyZzE6IEExLCBhcmcyOiBBMiwgYXJnMzogQTMsIGFyZzQ6IEE0LCBhcmc1OiBBNSwgY2FsbGJhY2s6IChyZXMxOiBSMSkgPT4gYW55KSA9PiBhbnksIHNjaGVkdWxlcj86IFNjaGVkdWxlckxpa2UpOiAoYXJnMTogQTEsIGFyZzI6IEEyLCBhcmczOiBBMywgYXJnNDogQTQsIGFyZzU6IEE1KSA9PiBPYnNlcnZhYmxlPFIxPjtcbmV4cG9ydCBmdW5jdGlvbiBiaW5kQ2FsbGJhY2s8QTEsIEEyLCBBMywgQTQsIEE1PihjYWxsYmFja0Z1bmM6IChhcmcxOiBBMSwgYXJnMjogQTIsIGFyZzM6IEEzLCBhcmc0OiBBNCwgYXJnNTogQTUsIGNhbGxiYWNrOiAoKSA9PiBhbnkpID0+IGFueSwgc2NoZWR1bGVyPzogU2NoZWR1bGVyTGlrZSk6IChhcmcxOiBBMSwgYXJnMjogQTIsIGFyZzM6IEEzLCBhcmc0OiBBNCwgYXJnNTogQTUpID0+IE9ic2VydmFibGU8dm9pZD47XG5cbmV4cG9ydCBmdW5jdGlvbiBiaW5kQ2FsbGJhY2s8QSwgUj4oY2FsbGJhY2tGdW5jOiAoLi4uYXJnczogQXJyYXk8QSB8ICgocmVzdWx0OiBSKSA9PiBhbnkpPikgPT4gYW55LCBzY2hlZHVsZXI/OiBTY2hlZHVsZXJMaWtlKTogKC4uLmFyZ3M6IEFbXSkgPT4gT2JzZXJ2YWJsZTxSPjtcbmV4cG9ydCBmdW5jdGlvbiBiaW5kQ2FsbGJhY2s8QSwgUj4oY2FsbGJhY2tGdW5jOiAoLi4uYXJnczogQXJyYXk8QSB8ICgoLi4ucmVzdWx0czogUltdKSA9PiBhbnkpPikgPT4gYW55LCBzY2hlZHVsZXI/OiBTY2hlZHVsZXJMaWtlKTogKC4uLmFyZ3M6IEFbXSkgPT4gT2JzZXJ2YWJsZTxSW10+O1xuXG5leHBvcnQgZnVuY3Rpb24gYmluZENhbGxiYWNrKGNhbGxiYWNrRnVuYzogRnVuY3Rpb24sIHNjaGVkdWxlcj86IFNjaGVkdWxlckxpa2UpOiAoLi4uYXJnczogYW55W10pID0+IE9ic2VydmFibGU8YW55PjtcblxuLy8gdHNsaW50OmVuYWJsZTptYXgtbGluZS1sZW5ndGhcblxuLyoqXG4gKiBDb252ZXJ0cyBhIGNhbGxiYWNrIEFQSSB0byBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhbiBPYnNlcnZhYmxlLlxuICpcbiAqIDxzcGFuIGNsYXNzPVwiaW5mb3JtYWxcIj5HaXZlIGl0IGEgZnVuY3Rpb24gYGZgIG9mIHR5cGUgYGYoeCwgY2FsbGJhY2spYCBhbmRcbiAqIGl0IHdpbGwgcmV0dXJuIGEgZnVuY3Rpb24gYGdgIHRoYXQgd2hlbiBjYWxsZWQgYXMgYGcoeClgIHdpbGwgb3V0cHV0IGFuXG4gKiBPYnNlcnZhYmxlLjwvc3Bhbj5cbiAqXG4gKiBgYmluZENhbGxiYWNrYCBpcyBub3QgYW4gb3BlcmF0b3IgYmVjYXVzZSBpdHMgaW5wdXQgYW5kIG91dHB1dCBhcmUgbm90XG4gKiBPYnNlcnZhYmxlcy4gVGhlIGlucHV0IGlzIGEgZnVuY3Rpb24gYGZ1bmNgIHdpdGggc29tZSBwYXJhbWV0ZXJzLiBUaGVcbiAqIGxhc3QgcGFyYW1ldGVyIG11c3QgYmUgYSBjYWxsYmFjayBmdW5jdGlvbiB0aGF0IGBmdW5jYCBjYWxscyB3aGVuIGl0IGlzXG4gKiBkb25lLlxuICpcbiAqIFRoZSBvdXRwdXQgb2YgYGJpbmRDYWxsYmFja2AgaXMgYSBmdW5jdGlvbiB0aGF0IHRha2VzIHRoZSBzYW1lIHBhcmFtZXRlcnNcbiAqIGFzIGBmdW5jYCwgZXhjZXB0IHRoZSBsYXN0IG9uZSAodGhlIGNhbGxiYWNrKS4gV2hlbiB0aGUgb3V0cHV0IGZ1bmN0aW9uXG4gKiBpcyBjYWxsZWQgd2l0aCBhcmd1bWVudHMgaXQgd2lsbCByZXR1cm4gYW4gT2JzZXJ2YWJsZS4gSWYgZnVuY3Rpb24gYGZ1bmNgXG4gKiBjYWxscyBpdHMgY2FsbGJhY2sgd2l0aCBvbmUgYXJndW1lbnQsIHRoZSBPYnNlcnZhYmxlIHdpbGwgZW1pdCB0aGF0IHZhbHVlLlxuICogSWYgb24gdGhlIG90aGVyIGhhbmQgdGhlIGNhbGxiYWNrIGlzIGNhbGxlZCB3aXRoIG11bHRpcGxlIHZhbHVlcyB0aGUgcmVzdWx0aW5nXG4gKiBPYnNlcnZhYmxlIHdpbGwgZW1pdCBhbiBhcnJheSB3aXRoIHNhaWQgdmFsdWVzIGFzIGFyZ3VtZW50cy5cbiAqXG4gKiBJdCBpcyAqKnZlcnkgaW1wb3J0YW50KiogdG8gcmVtZW1iZXIgdGhhdCBpbnB1dCBmdW5jdGlvbiBgZnVuY2AgaXMgbm90IGNhbGxlZFxuICogd2hlbiB0aGUgb3V0cHV0IGZ1bmN0aW9uIGlzLCBidXQgcmF0aGVyIHdoZW4gdGhlIE9ic2VydmFibGUgcmV0dXJuZWQgYnkgdGhlIG91dHB1dFxuICogZnVuY3Rpb24gaXMgc3Vic2NyaWJlZC4gVGhpcyBtZWFucyBpZiBgZnVuY2AgbWFrZXMgYW4gQUpBWCByZXF1ZXN0LCB0aGF0IHJlcXVlc3RcbiAqIHdpbGwgYmUgbWFkZSBldmVyeSB0aW1lIHNvbWVvbmUgc3Vic2NyaWJlcyB0byB0aGUgcmVzdWx0aW5nIE9ic2VydmFibGUsIGJ1dCBub3QgYmVmb3JlLlxuICpcbiAqIFRoZSBsYXN0IG9wdGlvbmFsIHBhcmFtZXRlciAtIGBzY2hlZHVsZXJgIC0gY2FuIGJlIHVzZWQgdG8gY29udHJvbCB3aGVuIHRoZSBjYWxsXG4gKiB0byBgZnVuY2AgaGFwcGVucyBhZnRlciBzb21lb25lIHN1YnNjcmliZXMgdG8gT2JzZXJ2YWJsZSwgYXMgd2VsbCBhcyB3aGVuIHJlc3VsdHNcbiAqIHBhc3NlZCB0byBjYWxsYmFjayB3aWxsIGJlIGVtaXR0ZWQuIEJ5IGRlZmF1bHQsIHRoZSBzdWJzY3JpcHRpb24gdG8gYW4gT2JzZXJ2YWJsZSBjYWxscyBgZnVuY2BcbiAqIHN5bmNocm9ub3VzbHksIGJ1dCB1c2luZyB7QGxpbmsgYXN5bmNTY2hlZHVsZXJ9IGFzIHRoZSBsYXN0IHBhcmFtZXRlciB3aWxsIGRlZmVyIHRoZSBjYWxsIHRvIGBmdW5jYCxcbiAqIGp1c3QgbGlrZSB3cmFwcGluZyB0aGUgY2FsbCBpbiBgc2V0VGltZW91dGAgd2l0aCBhIHRpbWVvdXQgb2YgYDBgIHdvdWxkLiBJZiB5b3Ugd2VyZSB0byB1c2UgdGhlIGFzeW5jIFNjaGVkdWxlclxuICogYW5kIGNhbGwgYHN1YnNjcmliZWAgb24gdGhlIG91dHB1dCBPYnNlcnZhYmxlLCBhbGwgZnVuY3Rpb24gY2FsbHMgdGhhdCBhcmUgY3VycmVudGx5IGV4ZWN1dGluZ1xuICogd2lsbCBlbmQgYmVmb3JlIGBmdW5jYCBpcyBpbnZva2VkLlxuICpcbiAqIEJ5IGRlZmF1bHQsIHJlc3VsdHMgcGFzc2VkIHRvIHRoZSBjYWxsYmFjayBhcmUgZW1pdHRlZCBpbW1lZGlhdGVseSBhZnRlciBgZnVuY2AgaW52b2tlcyB0aGUgY2FsbGJhY2suXG4gKiBJbiBwYXJ0aWN1bGFyLCBpZiB0aGUgY2FsbGJhY2sgaXMgY2FsbGVkIHN5bmNocm9ub3VzbHksIHRoZW4gdGhlIHN1YnNjcmlwdGlvbiBvZiB0aGUgcmVzdWx0aW5nIE9ic2VydmFibGVcbiAqIHdpbGwgY2FsbCB0aGUgYG5leHRgIGZ1bmN0aW9uIHN5bmNocm9ub3VzbHkgYXMgd2VsbC4gIElmIHlvdSB3YW50IHRvIGRlZmVyIHRoYXQgY2FsbCxcbiAqIHlvdSBtYXkgdXNlIHtAbGluayBhc3luY1NjaGVkdWxlcn0ganVzdCBhcyBiZWZvcmUuICBUaGlzIG1lYW5zIHRoYXQgYnkgdXNpbmcgYFNjaGVkdWxlci5hc3luY2AgeW91IGNhblxuICogZW5zdXJlIHRoYXQgYGZ1bmNgIGFsd2F5cyBjYWxscyBpdHMgY2FsbGJhY2sgYXN5bmNocm9ub3VzbHksIHRodXMgYXZvaWRpbmcgdGVycmlmeWluZyBaYWxnby5cbiAqXG4gKiBOb3RlIHRoYXQgdGhlIE9ic2VydmFibGUgY3JlYXRlZCBieSB0aGUgb3V0cHV0IGZ1bmN0aW9uIHdpbGwgYWx3YXlzIGVtaXQgYSBzaW5nbGUgdmFsdWVcbiAqIGFuZCB0aGVuIGNvbXBsZXRlIGltbWVkaWF0ZWx5LiBJZiBgZnVuY2AgY2FsbHMgdGhlIGNhbGxiYWNrIG11bHRpcGxlIHRpbWVzLCB2YWx1ZXMgZnJvbSBzdWJzZXF1ZW50XG4gKiBjYWxscyB3aWxsIG5vdCBhcHBlYXIgaW4gdGhlIHN0cmVhbS4gSWYgeW91IG5lZWQgdG8gbGlzdGVuIGZvciBtdWx0aXBsZSBjYWxscyxcbiAqICB5b3UgcHJvYmFibHkgd2FudCB0byB1c2Uge0BsaW5rIGZyb21FdmVudH0gb3Ige0BsaW5rIGZyb21FdmVudFBhdHRlcm59IGluc3RlYWQuXG4gKlxuICogSWYgYGZ1bmNgIGRlcGVuZHMgb24gc29tZSBjb250ZXh0IChgdGhpc2AgcHJvcGVydHkpIGFuZCBpcyBub3QgYWxyZWFkeSBib3VuZCwgdGhlIGNvbnRleHQgb2YgYGZ1bmNgXG4gKiB3aWxsIGJlIHRoZSBjb250ZXh0IHRoYXQgdGhlIG91dHB1dCBmdW5jdGlvbiBoYXMgYXQgY2FsbCB0aW1lLiBJbiBwYXJ0aWN1bGFyLCBpZiBgZnVuY2BcbiAqIGlzIGNhbGxlZCBhcyBhIG1ldGhvZCBvZiBzb21lIG9iamVjIGFuZCBpZiBgZnVuY2AgaXMgbm90IGFscmVhZHkgYm91bmQsIGluIG9yZGVyIHRvIHByZXNlcnZlIHRoZSBjb250ZXh0XG4gKiBpdCBpcyByZWNvbW1lbmRlZCB0aGF0IHRoZSBjb250ZXh0IG9mIHRoZSBvdXRwdXQgZnVuY3Rpb24gaXMgc2V0IHRvIHRoYXQgb2JqZWN0IGFzIHdlbGwuXG4gKlxuICogSWYgdGhlIGlucHV0IGZ1bmN0aW9uIGNhbGxzIGl0cyBjYWxsYmFjayBpbiB0aGUgXCJub2RlIHN0eWxlXCIgKGkuZS4gZmlyc3QgYXJndW1lbnQgdG8gY2FsbGJhY2sgaXNcbiAqIG9wdGlvbmFsIGVycm9yIHBhcmFtZXRlciBzaWduYWxpbmcgd2hldGhlciB0aGUgY2FsbCBmYWlsZWQgb3Igbm90KSwge0BsaW5rIGJpbmROb2RlQ2FsbGJhY2t9XG4gKiBwcm92aWRlcyBjb252ZW5pZW50IGVycm9yIGhhbmRsaW5nIGFuZCBwcm9iYWJseSBpcyBhIGJldHRlciBjaG9pY2UuXG4gKiBgYmluZENhbGxiYWNrYCB3aWxsIHRyZWF0IHN1Y2ggZnVuY3Rpb25zIHRoZSBzYW1lIGFzIGFueSBvdGhlciBhbmQgZXJyb3IgcGFyYW1ldGVyc1xuICogKHdoZXRoZXIgcGFzc2VkIG9yIG5vdCkgd2lsbCBhbHdheXMgYmUgaW50ZXJwcmV0ZWQgYXMgcmVndWxhciBjYWxsYmFjayBhcmd1bWVudC5cbiAqXG4gKiAjIyBFeGFtcGxlc1xuICpcbiAqICMjIyBDb252ZXJ0IGpRdWVyeSdzIGdldEpTT04gdG8gYW4gT2JzZXJ2YWJsZSBBUElcbiAqIGBgYGphdmFzY3JpcHRcbiAqIC8vIFN1cHBvc2Ugd2UgaGF2ZSBqUXVlcnkuZ2V0SlNPTignL215L3VybCcsIGNhbGxiYWNrKVxuICogY29uc3QgZ2V0SlNPTkFzT2JzZXJ2YWJsZSA9IGJpbmRDYWxsYmFjayhqUXVlcnkuZ2V0SlNPTik7XG4gKiBjb25zdCByZXN1bHQgPSBnZXRKU09OQXNPYnNlcnZhYmxlKCcvbXkvdXJsJyk7XG4gKiByZXN1bHQuc3Vic2NyaWJlKHggPT4gY29uc29sZS5sb2coeCksIGUgPT4gY29uc29sZS5lcnJvcihlKSk7XG4gKiBgYGBcbiAqXG4gKiAjIyMgUmVjZWl2ZSBhbiBhcnJheSBvZiBhcmd1bWVudHMgcGFzc2VkIHRvIGEgY2FsbGJhY2tcbiAqIGBgYGphdmFzY3JpcHRcbiAqIHNvbWVGdW5jdGlvbigoYSwgYiwgYykgPT4ge1xuICogICBjb25zb2xlLmxvZyhhKTsgLy8gNVxuICogICBjb25zb2xlLmxvZyhiKTsgLy8gJ3NvbWUgc3RyaW5nJ1xuICogICBjb25zb2xlLmxvZyhjKTsgLy8ge3NvbWVQcm9wZXJ0eTogJ3NvbWVWYWx1ZSd9XG4gKiB9KTtcbiAqXG4gKiBjb25zdCBib3VuZFNvbWVGdW5jdGlvbiA9IGJpbmRDYWxsYmFjayhzb21lRnVuY3Rpb24pO1xuICogYm91bmRTb21lRnVuY3Rpb24oKS5zdWJzY3JpYmUodmFsdWVzID0+IHtcbiAqICAgY29uc29sZS5sb2codmFsdWVzKSAvLyBbNSwgJ3NvbWUgc3RyaW5nJywge3NvbWVQcm9wZXJ0eTogJ3NvbWVWYWx1ZSd9XVxuICogfSk7XG4gKiBgYGBcbiAqXG4gKiAjIyMgQ29tcGFyZSBiZWhhdmlvdXIgd2l0aCBhbmQgd2l0aG91dCBhc3luYyBTY2hlZHVsZXJcbiAqIGBgYGphdmFzY3JpcHRcbiAqIGZ1bmN0aW9uIGlDYWxsTXlDYWxsYmFja1N5bmNocm9ub3VzbHkoY2IpIHtcbiAqICAgY2IoKTtcbiAqIH1cbiAqXG4gKiBjb25zdCBib3VuZFN5bmNGbiA9IGJpbmRDYWxsYmFjayhpQ2FsbE15Q2FsbGJhY2tTeW5jaHJvbm91c2x5KTtcbiAqIGNvbnN0IGJvdW5kQXN5bmNGbiA9IGJpbmRDYWxsYmFjayhpQ2FsbE15Q2FsbGJhY2tTeW5jaHJvbm91c2x5LCBudWxsLCBSeC5TY2hlZHVsZXIuYXN5bmMpO1xuICpcbiAqIGJvdW5kU3luY0ZuKCkuc3Vic2NyaWJlKCgpID0+IGNvbnNvbGUubG9nKCdJIHdhcyBzeW5jIScpKTtcbiAqIGJvdW5kQXN5bmNGbigpLnN1YnNjcmliZSgoKSA9PiBjb25zb2xlLmxvZygnSSB3YXMgYXN5bmMhJykpO1xuICogY29uc29sZS5sb2coJ1RoaXMgaGFwcGVuZWQuLi4nKTtcbiAqXG4gKiAvLyBMb2dzOlxuICogLy8gSSB3YXMgc3luYyFcbiAqIC8vIFRoaXMgaGFwcGVuZWQuLi5cbiAqIC8vIEkgd2FzIGFzeW5jIVxuICogYGBgXG4gKlxuICogIyMjIFVzZSBiaW5kQ2FsbGJhY2sgb24gYW4gb2JqZWN0IG1ldGhvZFxuICogYGBgamF2YXNjcmlwdFxuICogY29uc3QgYm91bmRNZXRob2QgPSBiaW5kQ2FsbGJhY2soc29tZU9iamVjdC5tZXRob2RXaXRoQ2FsbGJhY2spO1xuICogYm91bmRNZXRob2QuY2FsbChzb21lT2JqZWN0KSAvLyBtYWtlIHN1cmUgbWV0aG9kV2l0aENhbGxiYWNrIGhhcyBhY2Nlc3MgdG8gc29tZU9iamVjdFxuICogLnN1YnNjcmliZShzdWJzY3JpYmVyKTtcbiAqIGBgYFxuICpcbiAqIEBzZWUge0BsaW5rIGJpbmROb2RlQ2FsbGJhY2t9XG4gKiBAc2VlIHtAbGluayBmcm9tfVxuICpcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGZ1bmMgQSBmdW5jdGlvbiB3aXRoIGEgY2FsbGJhY2sgYXMgdGhlIGxhc3QgcGFyYW1ldGVyLlxuICogQHBhcmFtIHtTY2hlZHVsZXJMaWtlfSBbc2NoZWR1bGVyXSBUaGUgc2NoZWR1bGVyIG9uIHdoaWNoIHRvIHNjaGVkdWxlIHRoZVxuICogY2FsbGJhY2tzLlxuICogQHJldHVybiB7ZnVuY3Rpb24oLi4ucGFyYW1zOiAqKTogT2JzZXJ2YWJsZX0gQSBmdW5jdGlvbiB3aGljaCByZXR1cm5zIHRoZVxuICogT2JzZXJ2YWJsZSB0aGF0IGRlbGl2ZXJzIHRoZSBzYW1lIHZhbHVlcyB0aGUgY2FsbGJhY2sgd291bGQgZGVsaXZlci5cbiAqIEBuYW1lIGJpbmRDYWxsYmFja1xuICovXG5leHBvcnQgZnVuY3Rpb24gYmluZENhbGxiYWNrPFQ+KFxuICBjYWxsYmFja0Z1bmM6IEZ1bmN0aW9uLFxuICByZXN1bHRTZWxlY3Rvcj86IEZ1bmN0aW9ufFNjaGVkdWxlckxpa2UsXG4gIHNjaGVkdWxlcj86IFNjaGVkdWxlckxpa2Vcbik6ICguLi5hcmdzOiBhbnlbXSkgPT4gT2JzZXJ2YWJsZTxUPiB7XG4gIGlmIChyZXN1bHRTZWxlY3Rvcikge1xuICAgIGlmIChpc1NjaGVkdWxlcihyZXN1bHRTZWxlY3RvcikpIHtcbiAgICAgIHNjaGVkdWxlciA9IHJlc3VsdFNlbGVjdG9yO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBERVBSRUNBVEVEIFBBVEhcbiAgICAgIHJldHVybiAoLi4uYXJnczogYW55W10pID0+IGJpbmRDYWxsYmFjayhjYWxsYmFja0Z1bmMsIHNjaGVkdWxlcikoLi4uYXJncykucGlwZShcbiAgICAgICAgbWFwKChhcmdzKSA9PiBpc0FycmF5KGFyZ3MpID8gcmVzdWx0U2VsZWN0b3IoLi4uYXJncykgOiByZXN1bHRTZWxlY3RvcihhcmdzKSksXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAodGhpczogYW55LCAuLi5hcmdzOiBhbnlbXSk6IE9ic2VydmFibGU8VD4ge1xuICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgIGxldCBzdWJqZWN0OiBBc3luY1N1YmplY3Q8VD47XG4gICAgY29uc3QgcGFyYW1zID0ge1xuICAgICAgY29udGV4dCxcbiAgICAgIHN1YmplY3QsXG4gICAgICBjYWxsYmFja0Z1bmMsXG4gICAgICBzY2hlZHVsZXIsXG4gICAgfTtcbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGU8VD4oc3Vic2NyaWJlciA9PiB7XG4gICAgICBpZiAoIXNjaGVkdWxlcikge1xuICAgICAgICBpZiAoIXN1YmplY3QpIHtcbiAgICAgICAgICBzdWJqZWN0ID0gbmV3IEFzeW5jU3ViamVjdDxUPigpO1xuICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSAoLi4uaW5uZXJBcmdzOiBhbnlbXSkgPT4ge1xuICAgICAgICAgICAgc3ViamVjdC5uZXh0KGlubmVyQXJncy5sZW5ndGggPD0gMSA/IGlubmVyQXJnc1swXSA6IGlubmVyQXJncyk7XG4gICAgICAgICAgICBzdWJqZWN0LmNvbXBsZXRlKCk7XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjYWxsYmFja0Z1bmMuYXBwbHkoY29udGV4dCwgWy4uLmFyZ3MsIGhhbmRsZXJdKTtcbiAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGlmIChjYW5SZXBvcnRFcnJvcihzdWJqZWN0KSkge1xuICAgICAgICAgICAgICBzdWJqZWN0LmVycm9yKGVycik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb25zb2xlLndhcm4oZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN1YmplY3Quc3Vic2NyaWJlKHN1YnNjcmliZXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgc3RhdGU6IERpc3BhdGNoU3RhdGU8VD4gPSB7XG4gICAgICAgICAgYXJncywgc3Vic2NyaWJlciwgcGFyYW1zLFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gc2NoZWR1bGVyLnNjaGVkdWxlPERpc3BhdGNoU3RhdGU8VD4+KGRpc3BhdGNoLCAwLCBzdGF0ZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG59XG5cbmludGVyZmFjZSBEaXNwYXRjaFN0YXRlPFQ+IHtcbiAgYXJnczogYW55W107XG4gIHN1YnNjcmliZXI6IFN1YnNjcmliZXI8VD47XG4gIHBhcmFtczogUGFyYW1zQ29udGV4dDxUPjtcbn1cblxuaW50ZXJmYWNlIFBhcmFtc0NvbnRleHQ8VD4ge1xuICBjYWxsYmFja0Z1bmM6IEZ1bmN0aW9uO1xuICBzY2hlZHVsZXI6IFNjaGVkdWxlckxpa2U7XG4gIGNvbnRleHQ6IGFueTtcbiAgc3ViamVjdDogQXN5bmNTdWJqZWN0PFQ+O1xufVxuXG5mdW5jdGlvbiBkaXNwYXRjaDxUPih0aGlzOiBTY2hlZHVsZXJBY3Rpb248RGlzcGF0Y2hTdGF0ZTxUPj4sIHN0YXRlOiBEaXNwYXRjaFN0YXRlPFQ+KSB7XG4gIGNvbnN0IHNlbGYgPSB0aGlzO1xuICBjb25zdCB7IGFyZ3MsIHN1YnNjcmliZXIsIHBhcmFtcyB9ID0gc3RhdGU7XG4gIGNvbnN0IHsgY2FsbGJhY2tGdW5jLCBjb250ZXh0LCBzY2hlZHVsZXIgfSA9IHBhcmFtcztcbiAgbGV0IHsgc3ViamVjdCB9ID0gcGFyYW1zO1xuICBpZiAoIXN1YmplY3QpIHtcbiAgICBzdWJqZWN0ID0gcGFyYW1zLnN1YmplY3QgPSBuZXcgQXN5bmNTdWJqZWN0PFQ+KCk7XG5cbiAgICBjb25zdCBoYW5kbGVyID0gKC4uLmlubmVyQXJnczogYW55W10pID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gaW5uZXJBcmdzLmxlbmd0aCA8PSAxID8gaW5uZXJBcmdzWzBdIDogaW5uZXJBcmdzO1xuICAgICAgdGhpcy5hZGQoc2NoZWR1bGVyLnNjaGVkdWxlPE5leHRTdGF0ZTxUPj4oZGlzcGF0Y2hOZXh0LCAwLCB7IHZhbHVlLCBzdWJqZWN0IH0pKTtcbiAgICB9O1xuXG4gICAgdHJ5IHtcbiAgICAgIGNhbGxiYWNrRnVuYy5hcHBseShjb250ZXh0LCBbLi4uYXJncywgaGFuZGxlcl0pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgc3ViamVjdC5lcnJvcihlcnIpO1xuICAgIH1cbiAgfVxuXG4gIHRoaXMuYWRkKHN1YmplY3Quc3Vic2NyaWJlKHN1YnNjcmliZXIpKTtcbn1cblxuaW50ZXJmYWNlIE5leHRTdGF0ZTxUPiB7XG4gIHN1YmplY3Q6IEFzeW5jU3ViamVjdDxUPjtcbiAgdmFsdWU6IFQ7XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoTmV4dDxUPih0aGlzOiBTY2hlZHVsZXJBY3Rpb248TmV4dFN0YXRlPFQ+Piwgc3RhdGU6IE5leHRTdGF0ZTxUPikge1xuICBjb25zdCB7IHZhbHVlLCBzdWJqZWN0IH0gPSBzdGF0ZTtcbiAgc3ViamVjdC5uZXh0KHZhbHVlKTtcbiAgc3ViamVjdC5jb21wbGV0ZSgpO1xufVxuXG5pbnRlcmZhY2UgRXJyb3JTdGF0ZTxUPiB7XG4gIHN1YmplY3Q6IEFzeW5jU3ViamVjdDxUPjtcbiAgZXJyOiBhbnk7XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoRXJyb3I8VD4odGhpczogU2NoZWR1bGVyQWN0aW9uPEVycm9yU3RhdGU8VD4+LCBzdGF0ZTogRXJyb3JTdGF0ZTxUPikge1xuICBjb25zdCB7IGVyciwgc3ViamVjdCB9ID0gc3RhdGU7XG4gIHN1YmplY3QuZXJyb3IoZXJyKTtcbn1cbiJdfQ==