"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("../Observable");
var AsyncSubject_1 = require("../AsyncSubject");
var map_1 = require("../operators/map");
var canReportError_1 = require("../util/canReportError");
var isScheduler_1 = require("../util/isScheduler");
var isArray_1 = require("../util/isArray");
/**
 * Converts a Node.js-style callback API to a function that returns an
 * Observable.
 *
 * <span class="informal">It's just like {@link bindCallback}, but the
 * callback is expected to be of type `callback(error, result)`.</span>
 *
 * `bindNodeCallback` is not an operator because its input and output are not
 * Observables. The input is a function `func` with some parameters, but the
 * last parameter must be a callback function that `func` calls when it is
 * done. The callback function is expected to follow Node.js conventions,
 * where the first argument to the callback is an error object, signaling
 * whether call was successful. If that object is passed to callback, it means
 * something went wrong.
 *
 * The output of `bindNodeCallback` is a function that takes the same
 * parameters as `func`, except the last one (the callback). When the output
 * function is called with arguments, it will return an Observable.
 * If `func` calls its callback with error parameter present, Observable will
 * error with that value as well. If error parameter is not passed, Observable will emit
 * second parameter. If there are more parameters (third and so on),
 * Observable will emit an array with all arguments, except first error argument.
 *
 * Note that `func` will not be called at the same time output function is,
 * but rather whenever resulting Observable is subscribed. By default call to
 * `func` will happen synchronously after subscription, but that can be changed
 * with proper `scheduler` provided as optional third parameter. {@link SchedulerLike}
 * can also control when values from callback will be emitted by Observable.
 * To find out more, check out documentation for {@link bindCallback}, where
 * {@link SchedulerLike} works exactly the same.
 *
 * As in {@link bindCallback}, context (`this` property) of input function will be set to context
 * of returned function, when it is called.
 *
 * After Observable emits value, it will complete immediately. This means
 * even if `func` calls callback again, values from second and consecutive
 * calls will never appear on the stream. If you need to handle functions
 * that call callbacks multiple times, check out {@link fromEvent} or
 * {@link fromEventPattern} instead.
 *
 * Note that `bindNodeCallback` can be used in non-Node.js environments as well.
 * "Node.js-style" callbacks are just a convention, so if you write for
 * browsers or any other environment and API you use implements that callback style,
 * `bindNodeCallback` can be safely used on that API functions as well.
 *
 * Remember that Error object passed to callback does not have to be an instance
 * of JavaScript built-in `Error` object. In fact, it does not even have to an object.
 * Error parameter of callback function is interpreted as "present", when value
 * of that parameter is truthy. It could be, for example, non-zero number, non-empty
 * string or boolean `true`. In all of these cases resulting Observable would error
 * with that value. This means usually regular style callbacks will fail very often when
 * `bindNodeCallback` is used. If your Observable errors much more often then you
 * would expect, check if callback really is called in Node.js-style and, if not,
 * switch to {@link bindCallback} instead.
 *
 * Note that even if error parameter is technically present in callback, but its value
 * is falsy, it still won't appear in array emitted by Observable.
 *
 * ## Examples
 * ###  Read a file from the filesystem and get the data as an Observable
 * ```javascript
 * import * as fs from 'fs';
 * const readFileAsObservable = bindNodeCallback(fs.readFile);
 * const result = readFileAsObservable('./roadNames.txt', 'utf8');
 * result.subscribe(x => console.log(x), e => console.error(e));
 * ```
 *
 * ### Use on function calling callback with multiple arguments
 * ```javascript
 * someFunction((err, a, b) => {
 *   console.log(err); // null
 *   console.log(a); // 5
 *   console.log(b); // "some string"
 * });
 * const boundSomeFunction = bindNodeCallback(someFunction);
 * boundSomeFunction()
 * .subscribe(value => {
 *   console.log(value); // [5, "some string"]
 * });
 * ```
 *
 * ### Use on function calling callback in regular style
 * ```javascript
 * someFunction(a => {
 *   console.log(a); // 5
 * });
 * const boundSomeFunction = bindNodeCallback(someFunction);
 * boundSomeFunction()
 * .subscribe(
 *   value => {}             // never gets called
 *   err => console.log(err) // 5
 * );
 * ```
 *
 * @see {@link bindCallback}
 * @see {@link from}
 *
 * @param {function} func Function with a Node.js-style callback as the last parameter.
 * @param {SchedulerLike} [scheduler] The scheduler on which to schedule the
 * callbacks.
 * @return {function(...params: *): Observable} A function which returns the
 * Observable that delivers the same values the Node.js callback would
 * deliver.
 * @name bindNodeCallback
 */
function bindNodeCallback(callbackFunc, resultSelector, scheduler) {
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
                return bindNodeCallback(callbackFunc, scheduler).apply(void 0, args).pipe(map_1.map(function (args) { return isArray_1.isArray(args) ? resultSelector.apply(void 0, args) : resultSelector(args); }));
            };
        }
    }
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var params = {
            subject: undefined,
            args: args,
            callbackFunc: callbackFunc,
            scheduler: scheduler,
            context: this,
        };
        return new Observable_1.Observable(function (subscriber) {
            var context = params.context;
            var subject = params.subject;
            if (!scheduler) {
                if (!subject) {
                    subject = params.subject = new AsyncSubject_1.AsyncSubject();
                    var handler = function () {
                        var innerArgs = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            innerArgs[_i] = arguments[_i];
                        }
                        var err = innerArgs.shift();
                        if (err) {
                            subject.error(err);
                            return;
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
                return scheduler.schedule(dispatch, 0, { params: params, subscriber: subscriber, context: context });
            }
        });
    };
}
exports.bindNodeCallback = bindNodeCallback;
function dispatch(state) {
    var _this = this;
    var params = state.params, subscriber = state.subscriber, context = state.context;
    var callbackFunc = params.callbackFunc, args = params.args, scheduler = params.scheduler;
    var subject = params.subject;
    if (!subject) {
        subject = params.subject = new AsyncSubject_1.AsyncSubject();
        var handler = function () {
            var innerArgs = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                innerArgs[_i] = arguments[_i];
            }
            var err = innerArgs.shift();
            if (err) {
                _this.add(scheduler.schedule(dispatchError, 0, { err: err, subject: subject }));
            }
            else {
                var value = innerArgs.length <= 1 ? innerArgs[0] : innerArgs;
                _this.add(scheduler.schedule(dispatchNext, 0, { value: value, subject: subject }));
            }
        };
        try {
            callbackFunc.apply(context, args.concat([handler]));
        }
        catch (err) {
            this.add(scheduler.schedule(dispatchError, 0, { err: err, subject: subject }));
        }
    }
    this.add(subject.subscribe(subscriber));
}
function dispatchNext(arg) {
    var value = arg.value, subject = arg.subject;
    subject.next(value);
    subject.complete();
}
function dispatchError(arg) {
    var err = arg.err, subject = arg.subject;
    subject.error(err);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmluZE5vZGVDYWxsYmFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJpbmROb2RlQ2FsbGJhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw0Q0FBMkM7QUFDM0MsZ0RBQStDO0FBRy9DLHdDQUF1QztBQUN2Qyx5REFBd0Q7QUFDeEQsbURBQWtEO0FBQ2xELDJDQUEwQztBQTJDMUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBd0dHO0FBQ0gsU0FBZ0IsZ0JBQWdCLENBQzlCLFlBQXNCLEVBQ3RCLGNBQXNDLEVBQ3RDLFNBQXlCO0lBR3pCLElBQUksY0FBYyxFQUFFO1FBQ2xCLElBQUkseUJBQVcsQ0FBQyxjQUFjLENBQUMsRUFBRTtZQUMvQixTQUFTLEdBQUcsY0FBYyxDQUFDO1NBQzVCO2FBQU07WUFDTCxrQkFBa0I7WUFDbEIsT0FBTztnQkFBQyxjQUFjO3FCQUFkLFVBQWMsRUFBZCxxQkFBYyxFQUFkLElBQWM7b0JBQWQseUJBQWM7O2dCQUFLLE9BQUEsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxlQUFJLElBQUksRUFBRSxJQUFJLENBQ2hGLFNBQUcsQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLGlCQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsZUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBOUQsQ0FBOEQsQ0FBQyxDQUM1RTtZQUYwQixDQUUxQixDQUFDO1NBQ0g7S0FDRjtJQUVELE9BQU87UUFBb0IsY0FBYzthQUFkLFVBQWMsRUFBZCxxQkFBYyxFQUFkLElBQWM7WUFBZCx5QkFBYzs7UUFDdkMsSUFBTSxNQUFNLEdBQW1CO1lBQzdCLE9BQU8sRUFBRSxTQUFTO1lBQ2xCLElBQUksTUFBQTtZQUNK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WUFBWSxFQUFFLENBQUMsRUFBRSxFQUFFLEtBQUssT0FBQSxFQUFFLE9BQU8sU0FBQSxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ3ZGO1FBQ0gsQ0FBQyxDQUFDO1FBRUYsSUFBSTtZQUNGLFlBQVksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFNLElBQUksU0FBRSxPQUFPLEdBQUUsQ0FBQztTQUNqRDtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ1osSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFzQixhQUFhLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxLQUFBLEVBQUUsT0FBTyxTQUFBLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDdkY7S0FDRjtJQUVELElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0FBQzFDLENBQUM7QUFPRCxTQUFTLFlBQVksQ0FBSSxHQUF1QjtJQUN0QyxJQUFBLGlCQUFLLEVBQUUscUJBQU8sQ0FBUztJQUMvQixPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3BCLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUNyQixDQUFDO0FBT0QsU0FBUyxhQUFhLENBQUksR0FBd0I7SUFDeEMsSUFBQSxhQUFHLEVBQUUscUJBQU8sQ0FBUztJQUM3QixPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3JCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAnLi4vT2JzZXJ2YWJsZSc7XG5pbXBvcnQgeyBBc3luY1N1YmplY3QgfSBmcm9tICcuLi9Bc3luY1N1YmplY3QnO1xuaW1wb3J0IHsgU3Vic2NyaWJlciB9IGZyb20gJy4uL1N1YnNjcmliZXInO1xuaW1wb3J0IHsgU2NoZWR1bGVyQWN0aW9uLCBTY2hlZHVsZXJMaWtlIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IHsgbWFwIH0gZnJvbSAnLi4vb3BlcmF0b3JzL21hcCc7XG5pbXBvcnQgeyBjYW5SZXBvcnRFcnJvciB9IGZyb20gJy4uL3V0aWwvY2FuUmVwb3J0RXJyb3InO1xuaW1wb3J0IHsgaXNTY2hlZHVsZXIgfSBmcm9tICcuLi91dGlsL2lzU2NoZWR1bGVyJztcbmltcG9ydCB7IGlzQXJyYXkgfSBmcm9tICcuLi91dGlsL2lzQXJyYXknO1xuXG4vKiB0c2xpbnQ6ZGlzYWJsZTptYXgtbGluZS1sZW5ndGggKi9cbi8qKiBAZGVwcmVjYXRlZCByZXN1bHRTZWxlY3RvciBpcyBkZXByZWNhdGVkLCBwaXBlIHRvIG1hcCBpbnN0ZWFkICovXG5leHBvcnQgZnVuY3Rpb24gYmluZE5vZGVDYWxsYmFjayhjYWxsYmFja0Z1bmM6IEZ1bmN0aW9uLCByZXN1bHRTZWxlY3RvcjogRnVuY3Rpb24sIHNjaGVkdWxlcj86IFNjaGVkdWxlckxpa2UpOiAoLi4uYXJnczogYW55W10pID0+IE9ic2VydmFibGU8YW55PjtcblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmROb2RlQ2FsbGJhY2s8UjEsIFIyLCBSMywgUjQ+KGNhbGxiYWNrRnVuYzogKGNhbGxiYWNrOiAoZXJyOiBhbnksIHJlczE6IFIxLCByZXMyOiBSMiwgcmVzMzogUjMsIHJlczQ6IFI0LCAuLi5hcmdzOiBhbnlbXSkgPT4gYW55KSA9PiBhbnksIHNjaGVkdWxlcj86IFNjaGVkdWxlckxpa2UpOiAoLi4uYXJnczogYW55W10pID0+IE9ic2VydmFibGU8YW55W10+O1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmROb2RlQ2FsbGJhY2s8UjEsIFIyLCBSMz4oY2FsbGJhY2tGdW5jOiAoY2FsbGJhY2s6IChlcnI6IGFueSwgcmVzMTogUjEsIHJlczI6IFIyLCByZXMzOiBSMykgPT4gYW55KSA9PiBhbnksIHNjaGVkdWxlcj86IFNjaGVkdWxlckxpa2UpOiAoKSA9PiBPYnNlcnZhYmxlPFtSMSwgUjIsIFIzXT47XG5leHBvcnQgZnVuY3Rpb24gYmluZE5vZGVDYWxsYmFjazxSMSwgUjI+KGNhbGxiYWNrRnVuYzogKGNhbGxiYWNrOiAoZXJyOiBhbnksIHJlczE6IFIxLCByZXMyOiBSMikgPT4gYW55KSA9PiBhbnksIHNjaGVkdWxlcj86IFNjaGVkdWxlckxpa2UpOiAoKSA9PiBPYnNlcnZhYmxlPFtSMSwgUjJdPjtcbmV4cG9ydCBmdW5jdGlvbiBiaW5kTm9kZUNhbGxiYWNrPFIxPihjYWxsYmFja0Z1bmM6IChjYWxsYmFjazogKGVycjogYW55LCByZXMxOiBSMSkgPT4gYW55KSA9PiBhbnksIHNjaGVkdWxlcj86IFNjaGVkdWxlckxpa2UpOiAoKSA9PiBPYnNlcnZhYmxlPFIxPjtcbmV4cG9ydCBmdW5jdGlvbiBiaW5kTm9kZUNhbGxiYWNrKGNhbGxiYWNrRnVuYzogKGNhbGxiYWNrOiAoZXJyOiBhbnkpID0+IGFueSkgPT4gYW55LCBzY2hlZHVsZXI/OiBTY2hlZHVsZXJMaWtlKTogKCkgPT4gT2JzZXJ2YWJsZTx2b2lkPjtcblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmROb2RlQ2FsbGJhY2s8QTEsIFIxLCBSMiwgUjMsIFI0PihjYWxsYmFja0Z1bmM6IChhcmcxOiBBMSwgY2FsbGJhY2s6IChlcnI6IGFueSwgcmVzMTogUjEsIHJlczI6IFIyLCByZXMzOiBSMywgcmVzNDogUjQsIC4uLmFyZ3M6IGFueVtdKSA9PiBhbnkpID0+IGFueSwgc2NoZWR1bGVyPzogU2NoZWR1bGVyTGlrZSk6ICguLi5hcmdzOiBhbnlbXSkgPT4gT2JzZXJ2YWJsZTxhbnlbXT47XG5leHBvcnQgZnVuY3Rpb24gYmluZE5vZGVDYWxsYmFjazxBMSwgUjEsIFIyLCBSMz4oY2FsbGJhY2tGdW5jOiAoYXJnMTogQTEsIGNhbGxiYWNrOiAoZXJyOiBhbnksIHJlczE6IFIxLCByZXMyOiBSMiwgcmVzMzogUjMpID0+IGFueSkgPT4gYW55LCBzY2hlZHVsZXI/OiBTY2hlZHVsZXJMaWtlKTogKGFyZzE6IEExKSA9PiBPYnNlcnZhYmxlPFtSMSwgUjIsIFIzXT47XG5leHBvcnQgZnVuY3Rpb24gYmluZE5vZGVDYWxsYmFjazxBMSwgUjEsIFIyPihjYWxsYmFja0Z1bmM6IChhcmcxOiBBMSwgY2FsbGJhY2s6IChlcnI6IGFueSwgcmVzMTogUjEsIHJlczI6IFIyKSA9PiBhbnkpID0+IGFueSwgc2NoZWR1bGVyPzogU2NoZWR1bGVyTGlrZSk6IChhcmcxOiBBMSkgPT4gT2JzZXJ2YWJsZTxbUjEsIFIyXT47XG5leHBvcnQgZnVuY3Rpb24gYmluZE5vZGVDYWxsYmFjazxBMSwgUjE+KGNhbGxiYWNrRnVuYzogKGFyZzE6IEExLCBjYWxsYmFjazogKGVycjogYW55LCByZXMxOiBSMSkgPT4gYW55KSA9PiBhbnksIHNjaGVkdWxlcj86IFNjaGVkdWxlckxpa2UpOiAoYXJnMTogQTEpID0+IE9ic2VydmFibGU8UjE+O1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmROb2RlQ2FsbGJhY2s8QTE+KGNhbGxiYWNrRnVuYzogKGFyZzE6IEExLCBjYWxsYmFjazogKGVycjogYW55KSA9PiBhbnkpID0+IGFueSwgc2NoZWR1bGVyPzogU2NoZWR1bGVyTGlrZSk6IChhcmcxOiBBMSkgPT4gT2JzZXJ2YWJsZTx2b2lkPjtcblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmROb2RlQ2FsbGJhY2s8QTEsIEEyLCBSMSwgUjIsIFIzLCBSND4oY2FsbGJhY2tGdW5jOiAoYXJnMTogQTEsIGFyZzI6IEEyLCBjYWxsYmFjazogKGVycjogYW55LCByZXMxOiBSMSwgcmVzMjogUjIsIHJlczM6IFIzLCByZXM0OiBSNCwgLi4uYXJnczogYW55W10pID0+IGFueSkgPT4gYW55LCBzY2hlZHVsZXI/OiBTY2hlZHVsZXJMaWtlKTogKC4uLmFyZ3M6IGFueVtdKSA9PiBPYnNlcnZhYmxlPGFueVtdPjtcbmV4cG9ydCBmdW5jdGlvbiBiaW5kTm9kZUNhbGxiYWNrPEExLCBBMiwgUjEsIFIyLCBSMz4oY2FsbGJhY2tGdW5jOiAoYXJnMTogQTEsIGFyZzI6IEEyLCBjYWxsYmFjazogKGVycjogYW55LCByZXMxOiBSMSwgcmVzMjogUjIsIHJlczM6IFIzKSA9PiBhbnkpID0+IGFueSwgc2NoZWR1bGVyPzogU2NoZWR1bGVyTGlrZSk6IChhcmcxOiBBMSwgYXJnMjogQTIpID0+IE9ic2VydmFibGU8W1IxLCBSMiwgUjNdPjtcbmV4cG9ydCBmdW5jdGlvbiBiaW5kTm9kZUNhbGxiYWNrPEExLCBBMiwgUjEsIFIyPihjYWxsYmFja0Z1bmM6IChhcmcxOiBBMSwgYXJnMjogQTIsIGNhbGxiYWNrOiAoZXJyOiBhbnksIHJlczE6IFIxLCByZXMyOiBSMikgPT4gYW55KSA9PiBhbnksIHNjaGVkdWxlcj86IFNjaGVkdWxlckxpa2UpOiAoYXJnMTogQTEsIGFyZzI6IEEyKSA9PiBPYnNlcnZhYmxlPFtSMSwgUjJdPjtcbmV4cG9ydCBmdW5jdGlvbiBiaW5kTm9kZUNhbGxiYWNrPEExLCBBMiwgUjE+KGNhbGxiYWNrRnVuYzogKGFyZzE6IEExLCBhcmcyOiBBMiwgY2FsbGJhY2s6IChlcnI6IGFueSwgcmVzMTogUjEpID0+IGFueSkgPT4gYW55LCBzY2hlZHVsZXI/OiBTY2hlZHVsZXJMaWtlKTogKGFyZzE6IEExLCBhcmcyOiBBMikgPT4gT2JzZXJ2YWJsZTxSMT47XG5leHBvcnQgZnVuY3Rpb24gYmluZE5vZGVDYWxsYmFjazxBMSwgQTI+KGNhbGxiYWNrRnVuYzogKGFyZzE6IEExLCBhcmcyOiBBMiwgY2FsbGJhY2s6IChlcnI6IGFueSkgPT4gYW55KSA9PiBhbnksIHNjaGVkdWxlcj86IFNjaGVkdWxlckxpa2UpOiAoYXJnMTogQTEsIGFyZzI6IEEyKSA9PiBPYnNlcnZhYmxlPHZvaWQ+O1xuXG5leHBvcnQgZnVuY3Rpb24gYmluZE5vZGVDYWxsYmFjazxBMSwgQTIsIEEzLCBSMSwgUjIsIFIzLCBSND4oY2FsbGJhY2tGdW5jOiAoYXJnMTogQTEsIGFyZzI6IEEyLCBhcmczOiBBMywgY2FsbGJhY2s6IChlcnI6IGFueSwgcmVzMTogUjEsIHJlczI6IFIyLCByZXMzOiBSMywgcmVzNDogUjQsIC4uLmFyZ3M6IGFueVtdKSA9PiBhbnkpID0+IGFueSwgc2NoZWR1bGVyPzogU2NoZWR1bGVyTGlrZSk6ICguLi5hcmdzOiBhbnlbXSkgPT4gT2JzZXJ2YWJsZTxhbnlbXT47XG5leHBvcnQgZnVuY3Rpb24gYmluZE5vZGVDYWxsYmFjazxBMSwgQTIsIEEzLCBSMSwgUjIsIFIzPihjYWxsYmFja0Z1bmM6IChhcmcxOiBBMSwgYXJnMjogQTIsIGFyZzM6IEEzLCBjYWxsYmFjazogKGVycjogYW55LCByZXMxOiBSMSwgcmVzMjogUjIsIHJlczM6IFIzKSA9PiBhbnkpID0+IGFueSwgc2NoZWR1bGVyPzogU2NoZWR1bGVyTGlrZSk6IChhcmcxOiBBMSwgYXJnMjogQTIsIGFyZzM6IEEzKSA9PiBPYnNlcnZhYmxlPFtSMSwgUjIsIFIzXT47XG5leHBvcnQgZnVuY3Rpb24gYmluZE5vZGVDYWxsYmFjazxBMSwgQTIsIEEzLCBSMSwgUjI+KGNhbGxiYWNrRnVuYzogKGFyZzE6IEExLCBhcmcyOiBBMiwgYXJnMzogQTMsIGNhbGxiYWNrOiAoZXJyOiBhbnksIHJlczE6IFIxLCByZXMyOiBSMikgPT4gYW55KSA9PiBhbnksIHNjaGVkdWxlcj86IFNjaGVkdWxlckxpa2UpOiAoYXJnMTogQTEsIGFyZzI6IEEyLCBhcmczOiBBMykgPT4gT2JzZXJ2YWJsZTxbUjEsIFIyXT47XG5leHBvcnQgZnVuY3Rpb24gYmluZE5vZGVDYWxsYmFjazxBMSwgQTIsIEEzLCBSMT4oY2FsbGJhY2tGdW5jOiAoYXJnMTogQTEsIGFyZzI6IEEyLCBhcmczOiBBMywgY2FsbGJhY2s6IChlcnI6IGFueSwgcmVzMTogUjEpID0+IGFueSkgPT4gYW55LCBzY2hlZHVsZXI/OiBTY2hlZHVsZXJMaWtlKTogKGFyZzE6IEExLCBhcmcyOiBBMiwgYXJnMzogQTMpID0+IE9ic2VydmFibGU8UjE+O1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmROb2RlQ2FsbGJhY2s8QTEsIEEyLCBBMz4oY2FsbGJhY2tGdW5jOiAoYXJnMTogQTEsIGFyZzI6IEEyLCBhcmczOiBBMywgY2FsbGJhY2s6IChlcnI6IGFueSkgPT4gYW55KSA9PiBhbnksIHNjaGVkdWxlcj86IFNjaGVkdWxlckxpa2UpOiAoYXJnMTogQTEsIGFyZzI6IEEyLCBhcmczOiBBMykgPT4gT2JzZXJ2YWJsZTx2b2lkPjtcblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmROb2RlQ2FsbGJhY2s8QTEsIEEyLCBBMywgQTQsIFIxLCBSMiwgUjMsIFI0PihjYWxsYmFja0Z1bmM6IChhcmcxOiBBMSwgYXJnMjogQTIsIGFyZzM6IEEzLCBhcmc0OiBBNCwgY2FsbGJhY2s6IChlcnI6IGFueSwgcmVzMTogUjEsIHJlczI6IFIyLCByZXMzOiBSMywgcmVzNDogUjQsIC4uLmFyZ3M6IGFueVtdKSA9PiBhbnkpID0+IGFueSwgc2NoZWR1bGVyPzogU2NoZWR1bGVyTGlrZSk6ICguLi5hcmdzOiBhbnlbXSkgPT4gT2JzZXJ2YWJsZTxhbnlbXT47XG5leHBvcnQgZnVuY3Rpb24gYmluZE5vZGVDYWxsYmFjazxBMSwgQTIsIEEzLCBBNCwgUjEsIFIyLCBSMz4oY2FsbGJhY2tGdW5jOiAoYXJnMTogQTEsIGFyZzI6IEEyLCBhcmczOiBBMywgYXJnNDogQTQsIGNhbGxiYWNrOiAoZXJyOiBhbnksIHJlczE6IFIxLCByZXMyOiBSMiwgcmVzMzogUjMpID0+IGFueSkgPT4gYW55LCBzY2hlZHVsZXI/OiBTY2hlZHVsZXJMaWtlKTogKGFyZzE6IEExLCBhcmcyOiBBMiwgYXJnMzogQTMsIGFyZzQ6IEE0KSA9PiBPYnNlcnZhYmxlPFtSMSwgUjIsIFIzXT47XG5leHBvcnQgZnVuY3Rpb24gYmluZE5vZGVDYWxsYmFjazxBMSwgQTIsIEEzLCBBNCwgUjEsIFIyPihjYWxsYmFja0Z1bmM6IChhcmcxOiBBMSwgYXJnMjogQTIsIGFyZzM6IEEzLCBhcmc0OiBBNCwgY2FsbGJhY2s6IChlcnI6IGFueSwgcmVzMTogUjEsIHJlczI6IFIyKSA9PiBhbnkpID0+IGFueSwgc2NoZWR1bGVyPzogU2NoZWR1bGVyTGlrZSk6IChhcmcxOiBBMSwgYXJnMjogQTIsIGFyZzM6IEEzLCBhcmc0OiBBNCkgPT4gT2JzZXJ2YWJsZTxbUjEsIFIyXT47XG5leHBvcnQgZnVuY3Rpb24gYmluZE5vZGVDYWxsYmFjazxBMSwgQTIsIEEzLCBBNCwgUjE+KGNhbGxiYWNrRnVuYzogKGFyZzE6IEExLCBhcmcyOiBBMiwgYXJnMzogQTMsIGFyZzQ6IEE0LCBjYWxsYmFjazogKGVycjogYW55LCByZXMxOiBSMSkgPT4gYW55KSA9PiBhbnksIHNjaGVkdWxlcj86IFNjaGVkdWxlckxpa2UpOiAoYXJnMTogQTEsIGFyZzI6IEEyLCBhcmczOiBBMywgYXJnNDogQTQpID0+IE9ic2VydmFibGU8UjE+O1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmROb2RlQ2FsbGJhY2s8QTEsIEEyLCBBMywgQTQ+KGNhbGxiYWNrRnVuYzogKGFyZzE6IEExLCBhcmcyOiBBMiwgYXJnMzogQTMsIGFyZzQ6IEE0LCBjYWxsYmFjazogKGVycjogYW55KSA9PiBhbnkpID0+IGFueSwgc2NoZWR1bGVyPzogU2NoZWR1bGVyTGlrZSk6IChhcmcxOiBBMSwgYXJnMjogQTIsIGFyZzM6IEEzLCBhcmc0OiBBNCkgPT4gT2JzZXJ2YWJsZTx2b2lkPjtcblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmROb2RlQ2FsbGJhY2s8QTEsIEEyLCBBMywgQTQsIEE1LCBSMSwgUjIsIFIzLCBSND4oY2FsbGJhY2tGdW5jOiAoYXJnMTogQTEsIGFyZzI6IEEyLCBhcmczOiBBMywgYXJnNDogQTQsIGFyZzU6IEE1LCBjYWxsYmFjazogKGVycjogYW55LCByZXMxOiBSMSwgcmVzMjogUjIsIHJlczM6IFIzLCByZXM0OiBSNCwgLi4uYXJnczogYW55W10pID0+IGFueSkgPT4gYW55LCBzY2hlZHVsZXI/OiBTY2hlZHVsZXJMaWtlKTogKC4uLmFyZ3M6IGFueVtdKSA9PiBPYnNlcnZhYmxlPGFueVtdPjtcbmV4cG9ydCBmdW5jdGlvbiBiaW5kTm9kZUNhbGxiYWNrPEExLCBBMiwgQTMsIEE0LCBBNSwgUjEsIFIyLCBSMz4oY2FsbGJhY2tGdW5jOiAoYXJnMTogQTEsIGFyZzI6IEEyLCBhcmczOiBBMywgYXJnNDogQTQsIGFyZzU6IEE1LCBjYWxsYmFjazogKGVycjogYW55LCByZXMxOiBSMSwgcmVzMjogUjIsIHJlczM6IFIzKSA9PiBhbnkpID0+IGFueSwgc2NoZWR1bGVyPzogU2NoZWR1bGVyTGlrZSk6IChhcmcxOiBBMSwgYXJnMjogQTIsIGFyZzM6IEEzLCBhcmc0OiBBNCwgYXJnNTogQTUpID0+IE9ic2VydmFibGU8W1IxLCBSMiwgUjNdPjtcbmV4cG9ydCBmdW5jdGlvbiBiaW5kTm9kZUNhbGxiYWNrPEExLCBBMiwgQTMsIEE0LCBBNSwgUjEsIFIyPihjYWxsYmFja0Z1bmM6IChhcmcxOiBBMSwgYXJnMjogQTIsIGFyZzM6IEEzLCBhcmc0OiBBNCwgYXJnNTogQTUsIGNhbGxiYWNrOiAoZXJyOiBhbnksIHJlczE6IFIxLCByZXMyOiBSMikgPT4gYW55KSA9PiBhbnksIHNjaGVkdWxlcj86IFNjaGVkdWxlckxpa2UpOiAoYXJnMTogQTEsIGFyZzI6IEEyLCBhcmczOiBBMywgYXJnNDogQTQsIGFyZzU6IEE1KSA9PiBPYnNlcnZhYmxlPFtSMSwgUjJdPjtcbmV4cG9ydCBmdW5jdGlvbiBiaW5kTm9kZUNhbGxiYWNrPEExLCBBMiwgQTMsIEE0LCBBNSwgUjE+KGNhbGxiYWNrRnVuYzogKGFyZzE6IEExLCBhcmcyOiBBMiwgYXJnMzogQTMsIGFyZzQ6IEE0LCBhcmc1OiBBNSwgY2FsbGJhY2s6IChlcnI6IGFueSwgcmVzMTogUjEpID0+IGFueSkgPT4gYW55LCBzY2hlZHVsZXI/OiBTY2hlZHVsZXJMaWtlKTogKGFyZzE6IEExLCBhcmcyOiBBMiwgYXJnMzogQTMsIGFyZzQ6IEE0LCBhcmc1OiBBNSkgPT4gT2JzZXJ2YWJsZTxSMT47XG5leHBvcnQgZnVuY3Rpb24gYmluZE5vZGVDYWxsYmFjazxBMSwgQTIsIEEzLCBBNCwgQTU+KGNhbGxiYWNrRnVuYzogKGFyZzE6IEExLCBhcmcyOiBBMiwgYXJnMzogQTMsIGFyZzQ6IEE0LCBhcmc1OiBBNSwgY2FsbGJhY2s6IChlcnI6IGFueSkgPT4gYW55KSA9PiBhbnksIHNjaGVkdWxlcj86IFNjaGVkdWxlckxpa2UpOiAoYXJnMTogQTEsIGFyZzI6IEEyLCBhcmczOiBBMywgYXJnNDogQTQsIGFyZzU6IEE1KSA9PiBPYnNlcnZhYmxlPHZvaWQ+OyAvKiB0c2xpbnQ6ZW5hYmxlOm1heC1saW5lLWxlbmd0aCAqL1xuXG5leHBvcnQgZnVuY3Rpb24gYmluZE5vZGVDYWxsYmFjayhjYWxsYmFja0Z1bmM6IEZ1bmN0aW9uLCBzY2hlZHVsZXI/OiBTY2hlZHVsZXJMaWtlKTogKC4uLmFyZ3M6IGFueVtdKSA9PiBPYnNlcnZhYmxlPGFueVtdPjtcbi8qKlxuICogQ29udmVydHMgYSBOb2RlLmpzLXN0eWxlIGNhbGxiYWNrIEFQSSB0byBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhblxuICogT2JzZXJ2YWJsZS5cbiAqXG4gKiA8c3BhbiBjbGFzcz1cImluZm9ybWFsXCI+SXQncyBqdXN0IGxpa2Uge0BsaW5rIGJpbmRDYWxsYmFja30sIGJ1dCB0aGVcbiAqIGNhbGxiYWNrIGlzIGV4cGVjdGVkIHRvIGJlIG9mIHR5cGUgYGNhbGxiYWNrKGVycm9yLCByZXN1bHQpYC48L3NwYW4+XG4gKlxuICogYGJpbmROb2RlQ2FsbGJhY2tgIGlzIG5vdCBhbiBvcGVyYXRvciBiZWNhdXNlIGl0cyBpbnB1dCBhbmQgb3V0cHV0IGFyZSBub3RcbiAqIE9ic2VydmFibGVzLiBUaGUgaW5wdXQgaXMgYSBmdW5jdGlvbiBgZnVuY2Agd2l0aCBzb21lIHBhcmFtZXRlcnMsIGJ1dCB0aGVcbiAqIGxhc3QgcGFyYW1ldGVyIG11c3QgYmUgYSBjYWxsYmFjayBmdW5jdGlvbiB0aGF0IGBmdW5jYCBjYWxscyB3aGVuIGl0IGlzXG4gKiBkb25lLiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gaXMgZXhwZWN0ZWQgdG8gZm9sbG93IE5vZGUuanMgY29udmVudGlvbnMsXG4gKiB3aGVyZSB0aGUgZmlyc3QgYXJndW1lbnQgdG8gdGhlIGNhbGxiYWNrIGlzIGFuIGVycm9yIG9iamVjdCwgc2lnbmFsaW5nXG4gKiB3aGV0aGVyIGNhbGwgd2FzIHN1Y2Nlc3NmdWwuIElmIHRoYXQgb2JqZWN0IGlzIHBhc3NlZCB0byBjYWxsYmFjaywgaXQgbWVhbnNcbiAqIHNvbWV0aGluZyB3ZW50IHdyb25nLlxuICpcbiAqIFRoZSBvdXRwdXQgb2YgYGJpbmROb2RlQ2FsbGJhY2tgIGlzIGEgZnVuY3Rpb24gdGhhdCB0YWtlcyB0aGUgc2FtZVxuICogcGFyYW1ldGVycyBhcyBgZnVuY2AsIGV4Y2VwdCB0aGUgbGFzdCBvbmUgKHRoZSBjYWxsYmFjaykuIFdoZW4gdGhlIG91dHB1dFxuICogZnVuY3Rpb24gaXMgY2FsbGVkIHdpdGggYXJndW1lbnRzLCBpdCB3aWxsIHJldHVybiBhbiBPYnNlcnZhYmxlLlxuICogSWYgYGZ1bmNgIGNhbGxzIGl0cyBjYWxsYmFjayB3aXRoIGVycm9yIHBhcmFtZXRlciBwcmVzZW50LCBPYnNlcnZhYmxlIHdpbGxcbiAqIGVycm9yIHdpdGggdGhhdCB2YWx1ZSBhcyB3ZWxsLiBJZiBlcnJvciBwYXJhbWV0ZXIgaXMgbm90IHBhc3NlZCwgT2JzZXJ2YWJsZSB3aWxsIGVtaXRcbiAqIHNlY29uZCBwYXJhbWV0ZXIuIElmIHRoZXJlIGFyZSBtb3JlIHBhcmFtZXRlcnMgKHRoaXJkIGFuZCBzbyBvbiksXG4gKiBPYnNlcnZhYmxlIHdpbGwgZW1pdCBhbiBhcnJheSB3aXRoIGFsbCBhcmd1bWVudHMsIGV4Y2VwdCBmaXJzdCBlcnJvciBhcmd1bWVudC5cbiAqXG4gKiBOb3RlIHRoYXQgYGZ1bmNgIHdpbGwgbm90IGJlIGNhbGxlZCBhdCB0aGUgc2FtZSB0aW1lIG91dHB1dCBmdW5jdGlvbiBpcyxcbiAqIGJ1dCByYXRoZXIgd2hlbmV2ZXIgcmVzdWx0aW5nIE9ic2VydmFibGUgaXMgc3Vic2NyaWJlZC4gQnkgZGVmYXVsdCBjYWxsIHRvXG4gKiBgZnVuY2Agd2lsbCBoYXBwZW4gc3luY2hyb25vdXNseSBhZnRlciBzdWJzY3JpcHRpb24sIGJ1dCB0aGF0IGNhbiBiZSBjaGFuZ2VkXG4gKiB3aXRoIHByb3BlciBgc2NoZWR1bGVyYCBwcm92aWRlZCBhcyBvcHRpb25hbCB0aGlyZCBwYXJhbWV0ZXIuIHtAbGluayBTY2hlZHVsZXJMaWtlfVxuICogY2FuIGFsc28gY29udHJvbCB3aGVuIHZhbHVlcyBmcm9tIGNhbGxiYWNrIHdpbGwgYmUgZW1pdHRlZCBieSBPYnNlcnZhYmxlLlxuICogVG8gZmluZCBvdXQgbW9yZSwgY2hlY2sgb3V0IGRvY3VtZW50YXRpb24gZm9yIHtAbGluayBiaW5kQ2FsbGJhY2t9LCB3aGVyZVxuICoge0BsaW5rIFNjaGVkdWxlckxpa2V9IHdvcmtzIGV4YWN0bHkgdGhlIHNhbWUuXG4gKlxuICogQXMgaW4ge0BsaW5rIGJpbmRDYWxsYmFja30sIGNvbnRleHQgKGB0aGlzYCBwcm9wZXJ0eSkgb2YgaW5wdXQgZnVuY3Rpb24gd2lsbCBiZSBzZXQgdG8gY29udGV4dFxuICogb2YgcmV0dXJuZWQgZnVuY3Rpb24sIHdoZW4gaXQgaXMgY2FsbGVkLlxuICpcbiAqIEFmdGVyIE9ic2VydmFibGUgZW1pdHMgdmFsdWUsIGl0IHdpbGwgY29tcGxldGUgaW1tZWRpYXRlbHkuIFRoaXMgbWVhbnNcbiAqIGV2ZW4gaWYgYGZ1bmNgIGNhbGxzIGNhbGxiYWNrIGFnYWluLCB2YWx1ZXMgZnJvbSBzZWNvbmQgYW5kIGNvbnNlY3V0aXZlXG4gKiBjYWxscyB3aWxsIG5ldmVyIGFwcGVhciBvbiB0aGUgc3RyZWFtLiBJZiB5b3UgbmVlZCB0byBoYW5kbGUgZnVuY3Rpb25zXG4gKiB0aGF0IGNhbGwgY2FsbGJhY2tzIG11bHRpcGxlIHRpbWVzLCBjaGVjayBvdXQge0BsaW5rIGZyb21FdmVudH0gb3JcbiAqIHtAbGluayBmcm9tRXZlbnRQYXR0ZXJufSBpbnN0ZWFkLlxuICpcbiAqIE5vdGUgdGhhdCBgYmluZE5vZGVDYWxsYmFja2AgY2FuIGJlIHVzZWQgaW4gbm9uLU5vZGUuanMgZW52aXJvbm1lbnRzIGFzIHdlbGwuXG4gKiBcIk5vZGUuanMtc3R5bGVcIiBjYWxsYmFja3MgYXJlIGp1c3QgYSBjb252ZW50aW9uLCBzbyBpZiB5b3Ugd3JpdGUgZm9yXG4gKiBicm93c2VycyBvciBhbnkgb3RoZXIgZW52aXJvbm1lbnQgYW5kIEFQSSB5b3UgdXNlIGltcGxlbWVudHMgdGhhdCBjYWxsYmFjayBzdHlsZSxcbiAqIGBiaW5kTm9kZUNhbGxiYWNrYCBjYW4gYmUgc2FmZWx5IHVzZWQgb24gdGhhdCBBUEkgZnVuY3Rpb25zIGFzIHdlbGwuXG4gKlxuICogUmVtZW1iZXIgdGhhdCBFcnJvciBvYmplY3QgcGFzc2VkIHRvIGNhbGxiYWNrIGRvZXMgbm90IGhhdmUgdG8gYmUgYW4gaW5zdGFuY2VcbiAqIG9mIEphdmFTY3JpcHQgYnVpbHQtaW4gYEVycm9yYCBvYmplY3QuIEluIGZhY3QsIGl0IGRvZXMgbm90IGV2ZW4gaGF2ZSB0byBhbiBvYmplY3QuXG4gKiBFcnJvciBwYXJhbWV0ZXIgb2YgY2FsbGJhY2sgZnVuY3Rpb24gaXMgaW50ZXJwcmV0ZWQgYXMgXCJwcmVzZW50XCIsIHdoZW4gdmFsdWVcbiAqIG9mIHRoYXQgcGFyYW1ldGVyIGlzIHRydXRoeS4gSXQgY291bGQgYmUsIGZvciBleGFtcGxlLCBub24temVybyBudW1iZXIsIG5vbi1lbXB0eVxuICogc3RyaW5nIG9yIGJvb2xlYW4gYHRydWVgLiBJbiBhbGwgb2YgdGhlc2UgY2FzZXMgcmVzdWx0aW5nIE9ic2VydmFibGUgd291bGQgZXJyb3JcbiAqIHdpdGggdGhhdCB2YWx1ZS4gVGhpcyBtZWFucyB1c3VhbGx5IHJlZ3VsYXIgc3R5bGUgY2FsbGJhY2tzIHdpbGwgZmFpbCB2ZXJ5IG9mdGVuIHdoZW5cbiAqIGBiaW5kTm9kZUNhbGxiYWNrYCBpcyB1c2VkLiBJZiB5b3VyIE9ic2VydmFibGUgZXJyb3JzIG11Y2ggbW9yZSBvZnRlbiB0aGVuIHlvdVxuICogd291bGQgZXhwZWN0LCBjaGVjayBpZiBjYWxsYmFjayByZWFsbHkgaXMgY2FsbGVkIGluIE5vZGUuanMtc3R5bGUgYW5kLCBpZiBub3QsXG4gKiBzd2l0Y2ggdG8ge0BsaW5rIGJpbmRDYWxsYmFja30gaW5zdGVhZC5cbiAqXG4gKiBOb3RlIHRoYXQgZXZlbiBpZiBlcnJvciBwYXJhbWV0ZXIgaXMgdGVjaG5pY2FsbHkgcHJlc2VudCBpbiBjYWxsYmFjaywgYnV0IGl0cyB2YWx1ZVxuICogaXMgZmFsc3ksIGl0IHN0aWxsIHdvbid0IGFwcGVhciBpbiBhcnJheSBlbWl0dGVkIGJ5IE9ic2VydmFibGUuXG4gKlxuICogIyMgRXhhbXBsZXNcbiAqICMjIyAgUmVhZCBhIGZpbGUgZnJvbSB0aGUgZmlsZXN5c3RlbSBhbmQgZ2V0IHRoZSBkYXRhIGFzIGFuIE9ic2VydmFibGVcbiAqIGBgYGphdmFzY3JpcHRcbiAqIGltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbiAqIGNvbnN0IHJlYWRGaWxlQXNPYnNlcnZhYmxlID0gYmluZE5vZGVDYWxsYmFjayhmcy5yZWFkRmlsZSk7XG4gKiBjb25zdCByZXN1bHQgPSByZWFkRmlsZUFzT2JzZXJ2YWJsZSgnLi9yb2FkTmFtZXMudHh0JywgJ3V0ZjgnKTtcbiAqIHJlc3VsdC5zdWJzY3JpYmUoeCA9PiBjb25zb2xlLmxvZyh4KSwgZSA9PiBjb25zb2xlLmVycm9yKGUpKTtcbiAqIGBgYFxuICpcbiAqICMjIyBVc2Ugb24gZnVuY3Rpb24gY2FsbGluZyBjYWxsYmFjayB3aXRoIG11bHRpcGxlIGFyZ3VtZW50c1xuICogYGBgamF2YXNjcmlwdFxuICogc29tZUZ1bmN0aW9uKChlcnIsIGEsIGIpID0+IHtcbiAqICAgY29uc29sZS5sb2coZXJyKTsgLy8gbnVsbFxuICogICBjb25zb2xlLmxvZyhhKTsgLy8gNVxuICogICBjb25zb2xlLmxvZyhiKTsgLy8gXCJzb21lIHN0cmluZ1wiXG4gKiB9KTtcbiAqIGNvbnN0IGJvdW5kU29tZUZ1bmN0aW9uID0gYmluZE5vZGVDYWxsYmFjayhzb21lRnVuY3Rpb24pO1xuICogYm91bmRTb21lRnVuY3Rpb24oKVxuICogLnN1YnNjcmliZSh2YWx1ZSA9PiB7XG4gKiAgIGNvbnNvbGUubG9nKHZhbHVlKTsgLy8gWzUsIFwic29tZSBzdHJpbmdcIl1cbiAqIH0pO1xuICogYGBgXG4gKlxuICogIyMjIFVzZSBvbiBmdW5jdGlvbiBjYWxsaW5nIGNhbGxiYWNrIGluIHJlZ3VsYXIgc3R5bGVcbiAqIGBgYGphdmFzY3JpcHRcbiAqIHNvbWVGdW5jdGlvbihhID0+IHtcbiAqICAgY29uc29sZS5sb2coYSk7IC8vIDVcbiAqIH0pO1xuICogY29uc3QgYm91bmRTb21lRnVuY3Rpb24gPSBiaW5kTm9kZUNhbGxiYWNrKHNvbWVGdW5jdGlvbik7XG4gKiBib3VuZFNvbWVGdW5jdGlvbigpXG4gKiAuc3Vic2NyaWJlKFxuICogICB2YWx1ZSA9PiB7fSAgICAgICAgICAgICAvLyBuZXZlciBnZXRzIGNhbGxlZFxuICogICBlcnIgPT4gY29uc29sZS5sb2coZXJyKSAvLyA1XG4gKiApO1xuICogYGBgXG4gKlxuICogQHNlZSB7QGxpbmsgYmluZENhbGxiYWNrfVxuICogQHNlZSB7QGxpbmsgZnJvbX1cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBmdW5jIEZ1bmN0aW9uIHdpdGggYSBOb2RlLmpzLXN0eWxlIGNhbGxiYWNrIGFzIHRoZSBsYXN0IHBhcmFtZXRlci5cbiAqIEBwYXJhbSB7U2NoZWR1bGVyTGlrZX0gW3NjaGVkdWxlcl0gVGhlIHNjaGVkdWxlciBvbiB3aGljaCB0byBzY2hlZHVsZSB0aGVcbiAqIGNhbGxiYWNrcy5cbiAqIEByZXR1cm4ge2Z1bmN0aW9uKC4uLnBhcmFtczogKik6IE9ic2VydmFibGV9IEEgZnVuY3Rpb24gd2hpY2ggcmV0dXJucyB0aGVcbiAqIE9ic2VydmFibGUgdGhhdCBkZWxpdmVycyB0aGUgc2FtZSB2YWx1ZXMgdGhlIE5vZGUuanMgY2FsbGJhY2sgd291bGRcbiAqIGRlbGl2ZXIuXG4gKiBAbmFtZSBiaW5kTm9kZUNhbGxiYWNrXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiaW5kTm9kZUNhbGxiYWNrPFQ+KFxuICBjYWxsYmFja0Z1bmM6IEZ1bmN0aW9uLFxuICByZXN1bHRTZWxlY3RvcjogRnVuY3Rpb258U2NoZWR1bGVyTGlrZSxcbiAgc2NoZWR1bGVyPzogU2NoZWR1bGVyTGlrZVxuKTogKC4uLmFyZ3M6IGFueVtdKSA9PiBPYnNlcnZhYmxlPFQ+IHtcblxuICBpZiAocmVzdWx0U2VsZWN0b3IpIHtcbiAgICBpZiAoaXNTY2hlZHVsZXIocmVzdWx0U2VsZWN0b3IpKSB7XG4gICAgICBzY2hlZHVsZXIgPSByZXN1bHRTZWxlY3RvcjtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gREVQUkVDQVRFRCBQQVRIXG4gICAgICByZXR1cm4gKC4uLmFyZ3M6IGFueVtdKSA9PiBiaW5kTm9kZUNhbGxiYWNrKGNhbGxiYWNrRnVuYywgc2NoZWR1bGVyKSguLi5hcmdzKS5waXBlKFxuICAgICAgICBtYXAoYXJncyA9PiBpc0FycmF5KGFyZ3MpID8gcmVzdWx0U2VsZWN0b3IoLi4uYXJncykgOiByZXN1bHRTZWxlY3RvcihhcmdzKSlcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKHRoaXM6IGFueSwgLi4uYXJnczogYW55W10pOiBPYnNlcnZhYmxlPFQ+IHtcbiAgICBjb25zdCBwYXJhbXM6IFBhcmFtc1N0YXRlPFQ+ID0ge1xuICAgICAgc3ViamVjdDogdW5kZWZpbmVkLFxuICAgICAgYXJncyxcbiAgICAgIGNhbGxiYWNrRnVuYyxcbiAgICAgIHNjaGVkdWxlcixcbiAgICAgIGNvbnRleHQ6IHRoaXMsXG4gICAgfTtcbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGU8VD4oc3Vic2NyaWJlciA9PiB7XG4gICAgICBjb25zdCB7IGNvbnRleHQgfSA9IHBhcmFtcztcbiAgICAgIGxldCB7IHN1YmplY3QgfSA9IHBhcmFtcztcbiAgICAgIGlmICghc2NoZWR1bGVyKSB7XG4gICAgICAgIGlmICghc3ViamVjdCkge1xuICAgICAgICAgIHN1YmplY3QgPSBwYXJhbXMuc3ViamVjdCA9IG5ldyBBc3luY1N1YmplY3Q8VD4oKTtcbiAgICAgICAgICBjb25zdCBoYW5kbGVyID0gKC4uLmlubmVyQXJnczogYW55W10pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGVyciA9IGlubmVyQXJncy5zaGlmdCgpO1xuXG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgIHN1YmplY3QuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzdWJqZWN0Lm5leHQoaW5uZXJBcmdzLmxlbmd0aCA8PSAxID8gaW5uZXJBcmdzWzBdIDogaW5uZXJBcmdzKTtcbiAgICAgICAgICAgIHN1YmplY3QuY29tcGxldGUoKTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNhbGxiYWNrRnVuYy5hcHBseShjb250ZXh0LCBbLi4uYXJncywgaGFuZGxlcl0pO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgaWYgKGNhblJlcG9ydEVycm9yKHN1YmplY3QpKSB7XG4gICAgICAgICAgICAgIHN1YmplY3QuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUud2FybihlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3ViamVjdC5zdWJzY3JpYmUoc3Vic2NyaWJlcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gc2NoZWR1bGVyLnNjaGVkdWxlPERpc3BhdGNoU3RhdGU8VD4+KGRpc3BhdGNoLCAwLCB7IHBhcmFtcywgc3Vic2NyaWJlciwgY29udGV4dCB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn1cblxuaW50ZXJmYWNlIERpc3BhdGNoU3RhdGU8VD4ge1xuICBzdWJzY3JpYmVyOiBTdWJzY3JpYmVyPFQ+O1xuICBjb250ZXh0OiBhbnk7XG4gIHBhcmFtczogUGFyYW1zU3RhdGU8VD47XG59XG5cbmludGVyZmFjZSBQYXJhbXNTdGF0ZTxUPiB7XG4gIGNhbGxiYWNrRnVuYzogRnVuY3Rpb247XG4gIGFyZ3M6IGFueVtdO1xuICBzY2hlZHVsZXI6IFNjaGVkdWxlckxpa2U7XG4gIHN1YmplY3Q6IEFzeW5jU3ViamVjdDxUPjtcbiAgY29udGV4dDogYW55O1xufVxuXG5mdW5jdGlvbiBkaXNwYXRjaDxUPih0aGlzOiBTY2hlZHVsZXJBY3Rpb248RGlzcGF0Y2hTdGF0ZTxUPj4sIHN0YXRlOiBEaXNwYXRjaFN0YXRlPFQ+KSB7XG4gIGNvbnN0IHsgcGFyYW1zLCBzdWJzY3JpYmVyLCBjb250ZXh0IH0gPSBzdGF0ZTtcbiAgY29uc3QgeyBjYWxsYmFja0Z1bmMsIGFyZ3MsIHNjaGVkdWxlciB9ID0gcGFyYW1zO1xuICBsZXQgc3ViamVjdCA9IHBhcmFtcy5zdWJqZWN0O1xuXG4gIGlmICghc3ViamVjdCkge1xuICAgIHN1YmplY3QgPSBwYXJhbXMuc3ViamVjdCA9IG5ldyBBc3luY1N1YmplY3Q8VD4oKTtcblxuICAgIGNvbnN0IGhhbmRsZXIgPSAoLi4uaW5uZXJBcmdzOiBhbnlbXSkgPT4ge1xuICAgICAgY29uc3QgZXJyID0gaW5uZXJBcmdzLnNoaWZ0KCk7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHRoaXMuYWRkKHNjaGVkdWxlci5zY2hlZHVsZTxEaXNwYXRjaEVycm9yQXJnPFQ+PihkaXNwYXRjaEVycm9yLCAwLCB7IGVyciwgc3ViamVjdCB9KSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGlubmVyQXJncy5sZW5ndGggPD0gMSA/IGlubmVyQXJnc1swXSA6IGlubmVyQXJncztcbiAgICAgICAgdGhpcy5hZGQoc2NoZWR1bGVyLnNjaGVkdWxlPERpc3BhdGNoTmV4dEFyZzxUPj4oZGlzcGF0Y2hOZXh0LCAwLCB7IHZhbHVlLCBzdWJqZWN0IH0pKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdHJ5IHtcbiAgICAgIGNhbGxiYWNrRnVuYy5hcHBseShjb250ZXh0LCBbLi4uYXJncywgaGFuZGxlcl0pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhpcy5hZGQoc2NoZWR1bGVyLnNjaGVkdWxlPERpc3BhdGNoRXJyb3JBcmc8VD4+KGRpc3BhdGNoRXJyb3IsIDAsIHsgZXJyLCBzdWJqZWN0IH0pKTtcbiAgICB9XG4gIH1cblxuICB0aGlzLmFkZChzdWJqZWN0LnN1YnNjcmliZShzdWJzY3JpYmVyKSk7XG59XG5cbmludGVyZmFjZSBEaXNwYXRjaE5leHRBcmc8VD4ge1xuICBzdWJqZWN0OiBBc3luY1N1YmplY3Q8VD47XG4gIHZhbHVlOiBUO1xufVxuXG5mdW5jdGlvbiBkaXNwYXRjaE5leHQ8VD4oYXJnOiBEaXNwYXRjaE5leHRBcmc8VD4pIHtcbiAgY29uc3QgeyB2YWx1ZSwgc3ViamVjdCB9ID0gYXJnO1xuICBzdWJqZWN0Lm5leHQodmFsdWUpO1xuICBzdWJqZWN0LmNvbXBsZXRlKCk7XG59XG5cbmludGVyZmFjZSBEaXNwYXRjaEVycm9yQXJnPFQ+IHtcbiAgc3ViamVjdDogQXN5bmNTdWJqZWN0PFQ+O1xuICBlcnI6IGFueTtcbn1cblxuZnVuY3Rpb24gZGlzcGF0Y2hFcnJvcjxUPihhcmc6IERpc3BhdGNoRXJyb3JBcmc8VD4pIHtcbiAgY29uc3QgeyBlcnIsIHN1YmplY3QgfSA9IGFyZztcbiAgc3ViamVjdC5lcnJvcihlcnIpO1xufVxuIl19