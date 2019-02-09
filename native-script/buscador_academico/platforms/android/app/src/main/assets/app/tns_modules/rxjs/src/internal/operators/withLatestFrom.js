"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var OuterSubscriber_1 = require("../OuterSubscriber");
var subscribeToResult_1 = require("../util/subscribeToResult");
/* tslint:enable:max-line-length */
/**
 * Combines the source Observable with other Observables to create an Observable
 * whose values are calculated from the latest values of each, only when the
 * source emits.
 *
 * <span class="informal">Whenever the source Observable emits a value, it
 * computes a formula using that value plus the latest values from other input
 * Observables, then emits the output of that formula.</span>
 *
 * ![](withLatestFrom.png)
 *
 * `withLatestFrom` combines each value from the source Observable (the
 * instance) with the latest values from the other input Observables only when
 * the source emits a value, optionally using a `project` function to determine
 * the value to be emitted on the output Observable. All input Observables must
 * emit at least one value before the output Observable will emit a value.
 *
 * ## Example
 * On every click event, emit an array with the latest timer event plus the click event
 * ```javascript
 * const clicks = fromEvent(document, 'click');
 * const timer = interval(1000);
 * const result = clicks.pipe(withLatestFrom(timer));
 * result.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link combineLatest}
 *
 * @param {ObservableInput} other An input Observable to combine with the source
 * Observable. More than one input Observables may be given as argument.
 * @param {Function} [project] Projection function for combining values
 * together. Receives all values in order of the Observables passed, where the
 * first parameter is a value from the source Observable. (e.g.
 * `a.pipe(withLatestFrom(b, c), map(([a1, b1, c1]) => a1 + b1 + c1))`). If this is not
 * passed, arrays will be emitted on the output Observable.
 * @return {Observable} An Observable of projected values from the most recent
 * values from each input Observable, or an array of the most recent values from
 * each input Observable.
 * @method withLatestFrom
 * @owner Observable
 */
function withLatestFrom() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return function (source) {
        var project;
        if (typeof args[args.length - 1] === 'function') {
            project = args.pop();
        }
        var observables = args;
        return source.lift(new WithLatestFromOperator(observables, project));
    };
}
exports.withLatestFrom = withLatestFrom;
var WithLatestFromOperator = /** @class */ (function () {
    function WithLatestFromOperator(observables, project) {
        this.observables = observables;
        this.project = project;
    }
    WithLatestFromOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new WithLatestFromSubscriber(subscriber, this.observables, this.project));
    };
    return WithLatestFromOperator;
}());
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
var WithLatestFromSubscriber = /** @class */ (function (_super) {
    __extends(WithLatestFromSubscriber, _super);
    function WithLatestFromSubscriber(destination, observables, project) {
        var _this = _super.call(this, destination) || this;
        _this.observables = observables;
        _this.project = project;
        _this.toRespond = [];
        var len = observables.length;
        _this.values = new Array(len);
        for (var i = 0; i < len; i++) {
            _this.toRespond.push(i);
        }
        for (var i = 0; i < len; i++) {
            var observable = observables[i];
            _this.add(subscribeToResult_1.subscribeToResult(_this, observable, observable, i));
        }
        return _this;
    }
    WithLatestFromSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
        this.values[outerIndex] = innerValue;
        var toRespond = this.toRespond;
        if (toRespond.length > 0) {
            var found = toRespond.indexOf(outerIndex);
            if (found !== -1) {
                toRespond.splice(found, 1);
            }
        }
    };
    WithLatestFromSubscriber.prototype.notifyComplete = function () {
        // noop
    };
    WithLatestFromSubscriber.prototype._next = function (value) {
        if (this.toRespond.length === 0) {
            var args = [value].concat(this.values);
            if (this.project) {
                this._tryProject(args);
            }
            else {
                this.destination.next(args);
            }
        }
    };
    WithLatestFromSubscriber.prototype._tryProject = function (args) {
        var result;
        try {
            result = this.project.apply(this, args);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        this.destination.next(result);
    };
    return WithLatestFromSubscriber;
}(OuterSubscriber_1.OuterSubscriber));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2l0aExhdGVzdEZyb20uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ3aXRoTGF0ZXN0RnJvbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUdBLHNEQUFxRDtBQUVyRCwrREFBOEQ7QUFrQjlELG1DQUFtQztBQUVuQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXdDRztBQUNILFNBQWdCLGNBQWM7SUFBTyxjQUFxRTtTQUFyRSxVQUFxRSxFQUFyRSxxQkFBcUUsRUFBckUsSUFBcUU7UUFBckUseUJBQXFFOztJQUN4RyxPQUFPLFVBQUMsTUFBcUI7UUFDM0IsSUFBSSxPQUFZLENBQUM7UUFDakIsSUFBSSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLFVBQVUsRUFBRTtZQUMvQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1NBQ3RCO1FBQ0QsSUFBTSxXQUFXLEdBQXNCLElBQUksQ0FBQztRQUM1QyxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBc0IsQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUN2RSxDQUFDLENBQUM7QUFDSixDQUFDO0FBVEQsd0NBU0M7QUFFRDtJQUNFLGdDQUFvQixXQUE4QixFQUM5QixPQUE2QztRQUQ3QyxnQkFBVyxHQUFYLFdBQVcsQ0FBbUI7UUFDOUIsWUFBTyxHQUFQLE9BQU8sQ0FBc0M7SUFDakUsQ0FBQztJQUVELHFDQUFJLEdBQUosVUFBSyxVQUF5QixFQUFFLE1BQVc7UUFDekMsT0FBTyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksd0JBQXdCLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDcEcsQ0FBQztJQUNILDZCQUFDO0FBQUQsQ0FBQyxBQVJELElBUUM7QUFFRDs7OztHQUlHO0FBQ0g7SUFBNkMsNENBQXFCO0lBSWhFLGtDQUFZLFdBQTBCLEVBQ2xCLFdBQThCLEVBQzlCLE9BQTZDO1FBRmpFLFlBR0Usa0JBQU0sV0FBVyxDQUFDLFNBWW5CO1FBZG1CLGlCQUFXLEdBQVgsV0FBVyxDQUFtQjtRQUM5QixhQUFPLEdBQVAsT0FBTyxDQUFzQztRQUp6RCxlQUFTLEdBQWEsRUFBRSxDQUFDO1FBTS9CLElBQU0sR0FBRyxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUM7UUFDL0IsS0FBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUU3QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzVCLEtBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3hCO1FBRUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM1QixJQUFJLFVBQVUsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEMsS0FBSSxDQUFDLEdBQUcsQ0FBQyxxQ0FBaUIsQ0FBTyxLQUFJLEVBQUUsVUFBVSxFQUFPLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3pFOztJQUNILENBQUM7SUFFRCw2Q0FBVSxHQUFWLFVBQVcsVUFBYSxFQUFFLFVBQWEsRUFDNUIsVUFBa0IsRUFBRSxVQUFrQixFQUN0QyxRQUErQjtRQUN4QyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLFVBQVUsQ0FBQztRQUNyQyxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ2pDLElBQUksU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDeEIsSUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUM1QyxJQUFJLEtBQUssS0FBSyxDQUFDLENBQUMsRUFBRTtnQkFDaEIsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDNUI7U0FDRjtJQUNILENBQUM7SUFFRCxpREFBYyxHQUFkO1FBQ0UsT0FBTztJQUNULENBQUM7SUFFUyx3Q0FBSyxHQUFmLFVBQWdCLEtBQVE7UUFDdEIsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDL0IsSUFBTSxJQUFJLElBQUksS0FBSyxTQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNyQyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2hCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDeEI7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDN0I7U0FDRjtJQUNILENBQUM7SUFFTyw4Q0FBVyxHQUFuQixVQUFvQixJQUFXO1FBQzdCLElBQUksTUFBVyxDQUFDO1FBQ2hCLElBQUk7WUFDRixNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3pDO1FBQUMsT0FBTyxHQUFHLEVBQUU7WUFDWixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM1QixPQUFPO1NBQ1I7UUFDRCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBQ0gsK0JBQUM7QUFBRCxDQUFDLEFBM0RELENBQTZDLGlDQUFlLEdBMkQzRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE9wZXJhdG9yIH0gZnJvbSAnLi4vT3BlcmF0b3InO1xuaW1wb3J0IHsgU3Vic2NyaWJlciB9IGZyb20gJy4uL1N1YnNjcmliZXInO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJy4uL09ic2VydmFibGUnO1xuaW1wb3J0IHsgT3V0ZXJTdWJzY3JpYmVyIH0gZnJvbSAnLi4vT3V0ZXJTdWJzY3JpYmVyJztcbmltcG9ydCB7IElubmVyU3Vic2NyaWJlciB9IGZyb20gJy4uL0lubmVyU3Vic2NyaWJlcic7XG5pbXBvcnQgeyBzdWJzY3JpYmVUb1Jlc3VsdCB9IGZyb20gJy4uL3V0aWwvc3Vic2NyaWJlVG9SZXN1bHQnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZUlucHV0LCBPcGVyYXRvckZ1bmN0aW9uIH0gZnJvbSAnLi4vdHlwZXMnO1xuXG4vKiB0c2xpbnQ6ZGlzYWJsZTptYXgtbGluZS1sZW5ndGggKi9cbmV4cG9ydCBmdW5jdGlvbiB3aXRoTGF0ZXN0RnJvbTxULCBSPihwcm9qZWN0OiAodjE6IFQpID0+IFIpOiBPcGVyYXRvckZ1bmN0aW9uPFQsIFI+O1xuZXhwb3J0IGZ1bmN0aW9uIHdpdGhMYXRlc3RGcm9tPFQsIFQyLCBSPih2MjogT2JzZXJ2YWJsZUlucHV0PFQyPiwgcHJvamVjdDogKHYxOiBULCB2MjogVDIpID0+IFIpOiBPcGVyYXRvckZ1bmN0aW9uPFQsIFI+O1xuZXhwb3J0IGZ1bmN0aW9uIHdpdGhMYXRlc3RGcm9tPFQsIFQyLCBUMywgUj4odjI6IE9ic2VydmFibGVJbnB1dDxUMj4sIHYzOiBPYnNlcnZhYmxlSW5wdXQ8VDM+LCBwcm9qZWN0OiAodjE6IFQsIHYyOiBUMiwgdjM6IFQzKSA9PiBSKTogT3BlcmF0b3JGdW5jdGlvbjxULCBSPjtcbmV4cG9ydCBmdW5jdGlvbiB3aXRoTGF0ZXN0RnJvbTxULCBUMiwgVDMsIFQ0LCBSPih2MjogT2JzZXJ2YWJsZUlucHV0PFQyPiwgdjM6IE9ic2VydmFibGVJbnB1dDxUMz4sIHY0OiBPYnNlcnZhYmxlSW5wdXQ8VDQ+LCBwcm9qZWN0OiAodjE6IFQsIHYyOiBUMiwgdjM6IFQzLCB2NDogVDQpID0+IFIpOiBPcGVyYXRvckZ1bmN0aW9uPFQsIFI+O1xuZXhwb3J0IGZ1bmN0aW9uIHdpdGhMYXRlc3RGcm9tPFQsIFQyLCBUMywgVDQsIFQ1LCBSPih2MjogT2JzZXJ2YWJsZUlucHV0PFQyPiwgdjM6IE9ic2VydmFibGVJbnB1dDxUMz4sIHY0OiBPYnNlcnZhYmxlSW5wdXQ8VDQ+LCB2NTogT2JzZXJ2YWJsZUlucHV0PFQ1PiwgcHJvamVjdDogKHYxOiBULCB2MjogVDIsIHYzOiBUMywgdjQ6IFQ0LCB2NTogVDUpID0+IFIpOiBPcGVyYXRvckZ1bmN0aW9uPFQsIFI+O1xuZXhwb3J0IGZ1bmN0aW9uIHdpdGhMYXRlc3RGcm9tPFQsIFQyLCBUMywgVDQsIFQ1LCBUNiwgUj4odjI6IE9ic2VydmFibGVJbnB1dDxUMj4sIHYzOiBPYnNlcnZhYmxlSW5wdXQ8VDM+LCB2NDogT2JzZXJ2YWJsZUlucHV0PFQ0PiwgdjU6IE9ic2VydmFibGVJbnB1dDxUNT4sIHY2OiBPYnNlcnZhYmxlSW5wdXQ8VDY+LCBwcm9qZWN0OiAodjE6IFQsIHYyOiBUMiwgdjM6IFQzLCB2NDogVDQsIHY1OiBUNSwgdjY6IFQ2KSA9PiBSKTogT3BlcmF0b3JGdW5jdGlvbjxULCBSPiA7XG5leHBvcnQgZnVuY3Rpb24gd2l0aExhdGVzdEZyb208VCwgVDI+KHYyOiBPYnNlcnZhYmxlSW5wdXQ8VDI+KTogT3BlcmF0b3JGdW5jdGlvbjxULCBbVCwgVDJdPjtcbmV4cG9ydCBmdW5jdGlvbiB3aXRoTGF0ZXN0RnJvbTxULCBUMiwgVDM+KHYyOiBPYnNlcnZhYmxlSW5wdXQ8VDI+LCB2MzogT2JzZXJ2YWJsZUlucHV0PFQzPik6IE9wZXJhdG9yRnVuY3Rpb248VCwgW1QsIFQyLCBUM10+O1xuZXhwb3J0IGZ1bmN0aW9uIHdpdGhMYXRlc3RGcm9tPFQsIFQyLCBUMywgVDQ+KHYyOiBPYnNlcnZhYmxlSW5wdXQ8VDI+LCB2MzogT2JzZXJ2YWJsZUlucHV0PFQzPiwgdjQ6IE9ic2VydmFibGVJbnB1dDxUND4pOiBPcGVyYXRvckZ1bmN0aW9uPFQsIFtULCBUMiwgVDMsIFQ0XT47XG5leHBvcnQgZnVuY3Rpb24gd2l0aExhdGVzdEZyb208VCwgVDIsIFQzLCBUNCwgVDU+KHYyOiBPYnNlcnZhYmxlSW5wdXQ8VDI+LCB2MzogT2JzZXJ2YWJsZUlucHV0PFQzPiwgdjQ6IE9ic2VydmFibGVJbnB1dDxUND4sIHY1OiBPYnNlcnZhYmxlSW5wdXQ8VDU+KTogT3BlcmF0b3JGdW5jdGlvbjxULCBbVCwgVDIsIFQzLCBUNCwgVDVdPjtcbmV4cG9ydCBmdW5jdGlvbiB3aXRoTGF0ZXN0RnJvbTxULCBUMiwgVDMsIFQ0LCBUNSwgVDY+KHYyOiBPYnNlcnZhYmxlSW5wdXQ8VDI+LCB2MzogT2JzZXJ2YWJsZUlucHV0PFQzPiwgdjQ6IE9ic2VydmFibGVJbnB1dDxUND4sIHY1OiBPYnNlcnZhYmxlSW5wdXQ8VDU+LCB2NjogT2JzZXJ2YWJsZUlucHV0PFQ2Pik6IE9wZXJhdG9yRnVuY3Rpb248VCwgW1QsIFQyLCBUMywgVDQsIFQ1LCBUNl0+IDtcbmV4cG9ydCBmdW5jdGlvbiB3aXRoTGF0ZXN0RnJvbTxULCBSPiguLi5vYnNlcnZhYmxlczogQXJyYXk8T2JzZXJ2YWJsZUlucHV0PGFueT4gfCAoKC4uLnZhbHVlczogQXJyYXk8YW55PikgPT4gUik+KTogT3BlcmF0b3JGdW5jdGlvbjxULCBSPjtcbmV4cG9ydCBmdW5jdGlvbiB3aXRoTGF0ZXN0RnJvbTxULCBSPihhcnJheTogT2JzZXJ2YWJsZUlucHV0PGFueT5bXSk6IE9wZXJhdG9yRnVuY3Rpb248VCwgUj47XG5leHBvcnQgZnVuY3Rpb24gd2l0aExhdGVzdEZyb208VCwgUj4oYXJyYXk6IE9ic2VydmFibGVJbnB1dDxhbnk+W10sIHByb2plY3Q6ICguLi52YWx1ZXM6IEFycmF5PGFueT4pID0+IFIpOiBPcGVyYXRvckZ1bmN0aW9uPFQsIFI+O1xuLyogdHNsaW50OmVuYWJsZTptYXgtbGluZS1sZW5ndGggKi9cblxuLyoqXG4gKiBDb21iaW5lcyB0aGUgc291cmNlIE9ic2VydmFibGUgd2l0aCBvdGhlciBPYnNlcnZhYmxlcyB0byBjcmVhdGUgYW4gT2JzZXJ2YWJsZVxuICogd2hvc2UgdmFsdWVzIGFyZSBjYWxjdWxhdGVkIGZyb20gdGhlIGxhdGVzdCB2YWx1ZXMgb2YgZWFjaCwgb25seSB3aGVuIHRoZVxuICogc291cmNlIGVtaXRzLlxuICpcbiAqIDxzcGFuIGNsYXNzPVwiaW5mb3JtYWxcIj5XaGVuZXZlciB0aGUgc291cmNlIE9ic2VydmFibGUgZW1pdHMgYSB2YWx1ZSwgaXRcbiAqIGNvbXB1dGVzIGEgZm9ybXVsYSB1c2luZyB0aGF0IHZhbHVlIHBsdXMgdGhlIGxhdGVzdCB2YWx1ZXMgZnJvbSBvdGhlciBpbnB1dFxuICogT2JzZXJ2YWJsZXMsIHRoZW4gZW1pdHMgdGhlIG91dHB1dCBvZiB0aGF0IGZvcm11bGEuPC9zcGFuPlxuICpcbiAqICFbXSh3aXRoTGF0ZXN0RnJvbS5wbmcpXG4gKlxuICogYHdpdGhMYXRlc3RGcm9tYCBjb21iaW5lcyBlYWNoIHZhbHVlIGZyb20gdGhlIHNvdXJjZSBPYnNlcnZhYmxlICh0aGVcbiAqIGluc3RhbmNlKSB3aXRoIHRoZSBsYXRlc3QgdmFsdWVzIGZyb20gdGhlIG90aGVyIGlucHV0IE9ic2VydmFibGVzIG9ubHkgd2hlblxuICogdGhlIHNvdXJjZSBlbWl0cyBhIHZhbHVlLCBvcHRpb25hbGx5IHVzaW5nIGEgYHByb2plY3RgIGZ1bmN0aW9uIHRvIGRldGVybWluZVxuICogdGhlIHZhbHVlIHRvIGJlIGVtaXR0ZWQgb24gdGhlIG91dHB1dCBPYnNlcnZhYmxlLiBBbGwgaW5wdXQgT2JzZXJ2YWJsZXMgbXVzdFxuICogZW1pdCBhdCBsZWFzdCBvbmUgdmFsdWUgYmVmb3JlIHRoZSBvdXRwdXQgT2JzZXJ2YWJsZSB3aWxsIGVtaXQgYSB2YWx1ZS5cbiAqXG4gKiAjIyBFeGFtcGxlXG4gKiBPbiBldmVyeSBjbGljayBldmVudCwgZW1pdCBhbiBhcnJheSB3aXRoIHRoZSBsYXRlc3QgdGltZXIgZXZlbnQgcGx1cyB0aGUgY2xpY2sgZXZlbnRcbiAqIGBgYGphdmFzY3JpcHRcbiAqIGNvbnN0IGNsaWNrcyA9IGZyb21FdmVudChkb2N1bWVudCwgJ2NsaWNrJyk7XG4gKiBjb25zdCB0aW1lciA9IGludGVydmFsKDEwMDApO1xuICogY29uc3QgcmVzdWx0ID0gY2xpY2tzLnBpcGUod2l0aExhdGVzdEZyb20odGltZXIpKTtcbiAqIHJlc3VsdC5zdWJzY3JpYmUoeCA9PiBjb25zb2xlLmxvZyh4KSk7XG4gKiBgYGBcbiAqXG4gKiBAc2VlIHtAbGluayBjb21iaW5lTGF0ZXN0fVxuICpcbiAqIEBwYXJhbSB7T2JzZXJ2YWJsZUlucHV0fSBvdGhlciBBbiBpbnB1dCBPYnNlcnZhYmxlIHRvIGNvbWJpbmUgd2l0aCB0aGUgc291cmNlXG4gKiBPYnNlcnZhYmxlLiBNb3JlIHRoYW4gb25lIGlucHV0IE9ic2VydmFibGVzIG1heSBiZSBnaXZlbiBhcyBhcmd1bWVudC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtwcm9qZWN0XSBQcm9qZWN0aW9uIGZ1bmN0aW9uIGZvciBjb21iaW5pbmcgdmFsdWVzXG4gKiB0b2dldGhlci4gUmVjZWl2ZXMgYWxsIHZhbHVlcyBpbiBvcmRlciBvZiB0aGUgT2JzZXJ2YWJsZXMgcGFzc2VkLCB3aGVyZSB0aGVcbiAqIGZpcnN0IHBhcmFtZXRlciBpcyBhIHZhbHVlIGZyb20gdGhlIHNvdXJjZSBPYnNlcnZhYmxlLiAoZS5nLlxuICogYGEucGlwZSh3aXRoTGF0ZXN0RnJvbShiLCBjKSwgbWFwKChbYTEsIGIxLCBjMV0pID0+IGExICsgYjEgKyBjMSkpYCkuIElmIHRoaXMgaXMgbm90XG4gKiBwYXNzZWQsIGFycmF5cyB3aWxsIGJlIGVtaXR0ZWQgb24gdGhlIG91dHB1dCBPYnNlcnZhYmxlLlxuICogQHJldHVybiB7T2JzZXJ2YWJsZX0gQW4gT2JzZXJ2YWJsZSBvZiBwcm9qZWN0ZWQgdmFsdWVzIGZyb20gdGhlIG1vc3QgcmVjZW50XG4gKiB2YWx1ZXMgZnJvbSBlYWNoIGlucHV0IE9ic2VydmFibGUsIG9yIGFuIGFycmF5IG9mIHRoZSBtb3N0IHJlY2VudCB2YWx1ZXMgZnJvbVxuICogZWFjaCBpbnB1dCBPYnNlcnZhYmxlLlxuICogQG1ldGhvZCB3aXRoTGF0ZXN0RnJvbVxuICogQG93bmVyIE9ic2VydmFibGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdpdGhMYXRlc3RGcm9tPFQsIFI+KC4uLmFyZ3M6IEFycmF5PE9ic2VydmFibGVJbnB1dDxhbnk+IHwgKCguLi52YWx1ZXM6IEFycmF5PGFueT4pID0+IFIpPik6IE9wZXJhdG9yRnVuY3Rpb248VCwgUj4ge1xuICByZXR1cm4gKHNvdXJjZTogT2JzZXJ2YWJsZTxUPikgPT4ge1xuICAgIGxldCBwcm9qZWN0OiBhbnk7XG4gICAgaWYgKHR5cGVvZiBhcmdzW2FyZ3MubGVuZ3RoIC0gMV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHByb2plY3QgPSBhcmdzLnBvcCgpO1xuICAgIH1cbiAgICBjb25zdCBvYnNlcnZhYmxlcyA9IDxPYnNlcnZhYmxlPGFueT5bXT5hcmdzO1xuICAgIHJldHVybiBzb3VyY2UubGlmdChuZXcgV2l0aExhdGVzdEZyb21PcGVyYXRvcihvYnNlcnZhYmxlcywgcHJvamVjdCkpO1xuICB9O1xufVxuXG5jbGFzcyBXaXRoTGF0ZXN0RnJvbU9wZXJhdG9yPFQsIFI+IGltcGxlbWVudHMgT3BlcmF0b3I8VCwgUj4ge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG9ic2VydmFibGVzOiBPYnNlcnZhYmxlPGFueT5bXSxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBwcm9qZWN0PzogKC4uLnZhbHVlczogYW55W10pID0+IE9ic2VydmFibGU8Uj4pIHtcbiAgfVxuXG4gIGNhbGwoc3Vic2NyaWJlcjogU3Vic2NyaWJlcjxSPiwgc291cmNlOiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBzb3VyY2Uuc3Vic2NyaWJlKG5ldyBXaXRoTGF0ZXN0RnJvbVN1YnNjcmliZXIoc3Vic2NyaWJlciwgdGhpcy5vYnNlcnZhYmxlcywgdGhpcy5wcm9qZWN0KSk7XG4gIH1cbn1cblxuLyoqXG4gKiBXZSBuZWVkIHRoaXMgSlNEb2MgY29tbWVudCBmb3IgYWZmZWN0aW5nIEVTRG9jLlxuICogQGlnbm9yZVxuICogQGV4dGVuZHMge0lnbm9yZWR9XG4gKi9cbmNsYXNzIFdpdGhMYXRlc3RGcm9tU3Vic2NyaWJlcjxULCBSPiBleHRlbmRzIE91dGVyU3Vic2NyaWJlcjxULCBSPiB7XG4gIHByaXZhdGUgdmFsdWVzOiBhbnlbXTtcbiAgcHJpdmF0ZSB0b1Jlc3BvbmQ6IG51bWJlcltdID0gW107XG5cbiAgY29uc3RydWN0b3IoZGVzdGluYXRpb246IFN1YnNjcmliZXI8Uj4sXG4gICAgICAgICAgICAgIHByaXZhdGUgb2JzZXJ2YWJsZXM6IE9ic2VydmFibGU8YW55PltdLFxuICAgICAgICAgICAgICBwcml2YXRlIHByb2plY3Q/OiAoLi4udmFsdWVzOiBhbnlbXSkgPT4gT2JzZXJ2YWJsZTxSPikge1xuICAgIHN1cGVyKGRlc3RpbmF0aW9uKTtcbiAgICBjb25zdCBsZW4gPSBvYnNlcnZhYmxlcy5sZW5ndGg7XG4gICAgdGhpcy52YWx1ZXMgPSBuZXcgQXJyYXkobGVuKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIHRoaXMudG9SZXNwb25kLnB1c2goaSk7XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgbGV0IG9ic2VydmFibGUgPSBvYnNlcnZhYmxlc1tpXTtcbiAgICAgIHRoaXMuYWRkKHN1YnNjcmliZVRvUmVzdWx0PFQsIFI+KHRoaXMsIG9ic2VydmFibGUsIDxhbnk+b2JzZXJ2YWJsZSwgaSkpO1xuICAgIH1cbiAgfVxuXG4gIG5vdGlmeU5leHQob3V0ZXJWYWx1ZTogVCwgaW5uZXJWYWx1ZTogUixcbiAgICAgICAgICAgICBvdXRlckluZGV4OiBudW1iZXIsIGlubmVySW5kZXg6IG51bWJlcixcbiAgICAgICAgICAgICBpbm5lclN1YjogSW5uZXJTdWJzY3JpYmVyPFQsIFI+KTogdm9pZCB7XG4gICAgdGhpcy52YWx1ZXNbb3V0ZXJJbmRleF0gPSBpbm5lclZhbHVlO1xuICAgIGNvbnN0IHRvUmVzcG9uZCA9IHRoaXMudG9SZXNwb25kO1xuICAgIGlmICh0b1Jlc3BvbmQubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgZm91bmQgPSB0b1Jlc3BvbmQuaW5kZXhPZihvdXRlckluZGV4KTtcbiAgICAgIGlmIChmb3VuZCAhPT0gLTEpIHtcbiAgICAgICAgdG9SZXNwb25kLnNwbGljZShmb3VuZCwgMSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbm90aWZ5Q29tcGxldGUoKSB7XG4gICAgLy8gbm9vcFxuICB9XG5cbiAgcHJvdGVjdGVkIF9uZXh0KHZhbHVlOiBUKSB7XG4gICAgaWYgKHRoaXMudG9SZXNwb25kLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29uc3QgYXJncyA9IFt2YWx1ZSwgLi4udGhpcy52YWx1ZXNdO1xuICAgICAgaWYgKHRoaXMucHJvamVjdCkge1xuICAgICAgICB0aGlzLl90cnlQcm9qZWN0KGFyZ3MpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5kZXN0aW5hdGlvbi5uZXh0KGFyZ3MpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3RyeVByb2plY3QoYXJnczogYW55W10pIHtcbiAgICBsZXQgcmVzdWx0OiBhbnk7XG4gICAgdHJ5IHtcbiAgICAgIHJlc3VsdCA9IHRoaXMucHJvamVjdC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRoaXMuZGVzdGluYXRpb24uZXJyb3IoZXJyKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5kZXN0aW5hdGlvbi5uZXh0KHJlc3VsdCk7XG4gIH1cbn1cbiJdfQ==