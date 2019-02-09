"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Subscriber_1 = require("../Subscriber");
var Subscription_1 = require("../Subscription");
/**
 * Returns an Observable that mirrors the source Observable, but will call a specified function when
 * the source terminates on complete or error.
 * @param {function} callback Function to be called when source terminates.
 * @return {Observable} An Observable that mirrors the source, but will call the specified function on termination.
 * @method finally
 * @owner Observable
 */
function finalize(callback) {
    return function (source) { return source.lift(new FinallyOperator(callback)); };
}
exports.finalize = finalize;
var FinallyOperator = /** @class */ (function () {
    function FinallyOperator(callback) {
        this.callback = callback;
    }
    FinallyOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new FinallySubscriber(subscriber, this.callback));
    };
    return FinallyOperator;
}());
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
var FinallySubscriber = /** @class */ (function (_super) {
    __extends(FinallySubscriber, _super);
    function FinallySubscriber(destination, callback) {
        var _this = _super.call(this, destination) || this;
        _this.add(new Subscription_1.Subscription(callback));
        return _this;
    }
    return FinallySubscriber;
}(Subscriber_1.Subscriber));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluYWxpemUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJmaW5hbGl6ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLDRDQUEyQztBQUMzQyxnREFBK0M7QUFJL0M7Ozs7Ozs7R0FPRztBQUNILFNBQWdCLFFBQVEsQ0FBSSxRQUFvQjtJQUM5QyxPQUFPLFVBQUMsTUFBcUIsSUFBSyxPQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBMUMsQ0FBMEMsQ0FBQztBQUMvRSxDQUFDO0FBRkQsNEJBRUM7QUFFRDtJQUNFLHlCQUFvQixRQUFvQjtRQUFwQixhQUFRLEdBQVIsUUFBUSxDQUFZO0lBQ3hDLENBQUM7SUFFRCw4QkFBSSxHQUFKLFVBQUssVUFBeUIsRUFBRSxNQUFXO1FBQ3pDLE9BQU8sTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGlCQUFpQixDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUM1RSxDQUFDO0lBQ0gsc0JBQUM7QUFBRCxDQUFDLEFBUEQsSUFPQztBQUVEOzs7O0dBSUc7QUFDSDtJQUFtQyxxQ0FBYTtJQUM5QywyQkFBWSxXQUEwQixFQUFFLFFBQW9CO1FBQTVELFlBQ0Usa0JBQU0sV0FBVyxDQUFDLFNBRW5CO1FBREMsS0FBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLDJCQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQzs7SUFDdkMsQ0FBQztJQUNILHdCQUFDO0FBQUQsQ0FBQyxBQUxELENBQW1DLHVCQUFVLEdBSzVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgT3BlcmF0b3IgfSBmcm9tICcuLi9PcGVyYXRvcic7XG5pbXBvcnQgeyBTdWJzY3JpYmVyIH0gZnJvbSAnLi4vU3Vic2NyaWJlcic7XG5pbXBvcnQgeyBTdWJzY3JpcHRpb24gfSBmcm9tICcuLi9TdWJzY3JpcHRpb24nO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJy4uL09ic2VydmFibGUnO1xuaW1wb3J0IHsgTW9ub1R5cGVPcGVyYXRvckZ1bmN0aW9uLCBUZWFyZG93bkxvZ2ljIH0gZnJvbSAnLi4vdHlwZXMnO1xuXG4vKipcbiAqIFJldHVybnMgYW4gT2JzZXJ2YWJsZSB0aGF0IG1pcnJvcnMgdGhlIHNvdXJjZSBPYnNlcnZhYmxlLCBidXQgd2lsbCBjYWxsIGEgc3BlY2lmaWVkIGZ1bmN0aW9uIHdoZW5cbiAqIHRoZSBzb3VyY2UgdGVybWluYXRlcyBvbiBjb21wbGV0ZSBvciBlcnJvci5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIEZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIHNvdXJjZSB0ZXJtaW5hdGVzLlxuICogQHJldHVybiB7T2JzZXJ2YWJsZX0gQW4gT2JzZXJ2YWJsZSB0aGF0IG1pcnJvcnMgdGhlIHNvdXJjZSwgYnV0IHdpbGwgY2FsbCB0aGUgc3BlY2lmaWVkIGZ1bmN0aW9uIG9uIHRlcm1pbmF0aW9uLlxuICogQG1ldGhvZCBmaW5hbGx5XG4gKiBAb3duZXIgT2JzZXJ2YWJsZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZmluYWxpemU8VD4oY2FsbGJhY2s6ICgpID0+IHZvaWQpOiBNb25vVHlwZU9wZXJhdG9yRnVuY3Rpb248VD4ge1xuICByZXR1cm4gKHNvdXJjZTogT2JzZXJ2YWJsZTxUPikgPT4gc291cmNlLmxpZnQobmV3IEZpbmFsbHlPcGVyYXRvcihjYWxsYmFjaykpO1xufVxuXG5jbGFzcyBGaW5hbGx5T3BlcmF0b3I8VD4gaW1wbGVtZW50cyBPcGVyYXRvcjxULCBUPiB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgY2FsbGJhY2s6ICgpID0+IHZvaWQpIHtcbiAgfVxuXG4gIGNhbGwoc3Vic2NyaWJlcjogU3Vic2NyaWJlcjxUPiwgc291cmNlOiBhbnkpOiBUZWFyZG93bkxvZ2ljIHtcbiAgICByZXR1cm4gc291cmNlLnN1YnNjcmliZShuZXcgRmluYWxseVN1YnNjcmliZXIoc3Vic2NyaWJlciwgdGhpcy5jYWxsYmFjaykpO1xuICB9XG59XG5cbi8qKlxuICogV2UgbmVlZCB0aGlzIEpTRG9jIGNvbW1lbnQgZm9yIGFmZmVjdGluZyBFU0RvYy5cbiAqIEBpZ25vcmVcbiAqIEBleHRlbmRzIHtJZ25vcmVkfVxuICovXG5jbGFzcyBGaW5hbGx5U3Vic2NyaWJlcjxUPiBleHRlbmRzIFN1YnNjcmliZXI8VD4ge1xuICBjb25zdHJ1Y3RvcihkZXN0aW5hdGlvbjogU3Vic2NyaWJlcjxUPiwgY2FsbGJhY2s6ICgpID0+IHZvaWQpIHtcbiAgICBzdXBlcihkZXN0aW5hdGlvbik7XG4gICAgdGhpcy5hZGQobmV3IFN1YnNjcmlwdGlvbihjYWxsYmFjaykpO1xuICB9XG59XG4iXX0=