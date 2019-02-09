/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var _global = typeof window !== 'undefined' && window || typeof self !== 'undefined' && self || global;
var AsyncTestZoneSpec = /** @class */ (function () {
    function AsyncTestZoneSpec(finishCallback, failCallback, namePrefix) {
        this.finishCallback = finishCallback;
        this.failCallback = failCallback;
        this._pendingMicroTasks = false;
        this._pendingMacroTasks = false;
        this._alreadyErrored = false;
        this._isSync = false;
        this.runZone = Zone.current;
        this.unresolvedChainedPromiseCount = 0;
        this.supportWaitUnresolvedChainedPromise = false;
        this.name = 'asyncTestZone for ' + namePrefix;
        this.properties = { 'AsyncTestZoneSpec': this };
        this.supportWaitUnresolvedChainedPromise =
            _global[Zone.__symbol__('supportWaitUnResolvedChainedPromise')] === true;
    }
    AsyncTestZoneSpec.prototype.isUnresolvedChainedPromisePending = function () {
        return this.unresolvedChainedPromiseCount > 0;
    };
    AsyncTestZoneSpec.prototype._finishCallbackIfDone = function () {
        var _this = this;
        if (!(this._pendingMicroTasks || this._pendingMacroTasks ||
            (this.supportWaitUnresolvedChainedPromise && this.isUnresolvedChainedPromisePending()))) {
            // We do this because we would like to catch unhandled rejected promises.
            this.runZone.run(function () {
                setTimeout(function () {
                    if (!_this._alreadyErrored && !(_this._pendingMicroTasks || _this._pendingMacroTasks)) {
                        _this.finishCallback();
                    }
                }, 0);
            });
        }
    };
    AsyncTestZoneSpec.prototype.patchPromiseForTest = function () {
        if (!this.supportWaitUnresolvedChainedPromise) {
            return;
        }
        var patchPromiseForTest = Promise[Zone.__symbol__('patchPromiseForTest')];
        if (patchPromiseForTest) {
            patchPromiseForTest();
        }
    };
    AsyncTestZoneSpec.prototype.unPatchPromiseForTest = function () {
        if (!this.supportWaitUnresolvedChainedPromise) {
            return;
        }
        var unPatchPromiseForTest = Promise[Zone.__symbol__('unPatchPromiseForTest')];
        if (unPatchPromiseForTest) {
            unPatchPromiseForTest();
        }
    };
    AsyncTestZoneSpec.prototype.onScheduleTask = function (delegate, current, target, task) {
        if (task.type !== 'eventTask') {
            this._isSync = false;
        }
        if (task.type === 'microTask' && task.data && task.data instanceof Promise) {
            // check whether the promise is a chained promise
            if (task.data[AsyncTestZoneSpec.symbolParentUnresolved] === true) {
                // chained promise is being scheduled
                this.unresolvedChainedPromiseCount--;
            }
        }
        return delegate.scheduleTask(target, task);
    };
    AsyncTestZoneSpec.prototype.onInvokeTask = function (delegate, current, target, task, applyThis, applyArgs) {
        if (task.type !== 'eventTask') {
            this._isSync = false;
        }
        return delegate.invokeTask(target, task, applyThis, applyArgs);
    };
    AsyncTestZoneSpec.prototype.onCancelTask = function (delegate, current, target, task) {
        if (task.type !== 'eventTask') {
            this._isSync = false;
        }
        return delegate.cancelTask(target, task);
    };
    // Note - we need to use onInvoke at the moment to call finish when a test is
    // fully synchronous. TODO(juliemr): remove this when the logic for
    // onHasTask changes and it calls whenever the task queues are dirty.
    // updated by(JiaLiPassion), only call finish callback when no task
    // was scheduled/invoked/canceled.
    AsyncTestZoneSpec.prototype.onInvoke = function (parentZoneDelegate, currentZone, targetZone, delegate, applyThis, applyArgs, source) {
        var previousTaskCounts = null;
        try {
            this._isSync = true;
            return parentZoneDelegate.invoke(targetZone, delegate, applyThis, applyArgs, source);
        }
        finally {
            var afterTaskCounts = parentZoneDelegate._taskCounts;
            if (this._isSync) {
                this._finishCallbackIfDone();
            }
        }
    };
    AsyncTestZoneSpec.prototype.onHandleError = function (parentZoneDelegate, currentZone, targetZone, error) {
        // Let the parent try to handle the error.
        var result = parentZoneDelegate.handleError(targetZone, error);
        if (result) {
            this.failCallback(error);
            this._alreadyErrored = true;
        }
        return false;
    };
    AsyncTestZoneSpec.prototype.onHasTask = function (delegate, current, target, hasTaskState) {
        delegate.hasTask(target, hasTaskState);
        if (hasTaskState.change == 'microTask') {
            this._pendingMicroTasks = hasTaskState.microTask;
            this._finishCallbackIfDone();
        }
        else if (hasTaskState.change == 'macroTask') {
            this._pendingMacroTasks = hasTaskState.macroTask;
            this._finishCallbackIfDone();
        }
    };
    AsyncTestZoneSpec.symbolParentUnresolved = Zone.__symbol__('parentUnresolved');
    return AsyncTestZoneSpec;
}());
// Export the class so that new instances can be created with proper
// constructor params.
Zone['AsyncTestZoneSpec'] = AsyncTestZoneSpec;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmMtdGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFzeW5jLXRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsSUFBTSxPQUFPLEdBQ1QsT0FBTyxNQUFNLEtBQUssV0FBVyxJQUFJLE1BQU0sSUFBSSxPQUFPLElBQUksS0FBSyxXQUFXLElBQUksSUFBSSxJQUFJLE1BQU0sQ0FBQztBQUM3RjtJQVlFLDJCQUNZLGNBQXdCLEVBQVUsWUFBc0IsRUFBRSxVQUFrQjtRQUE1RSxtQkFBYyxHQUFkLGNBQWMsQ0FBVTtRQUFVLGlCQUFZLEdBQVosWUFBWSxDQUFVO1FBVnBFLHVCQUFrQixHQUFZLEtBQUssQ0FBQztRQUNwQyx1QkFBa0IsR0FBWSxLQUFLLENBQUM7UUFDcEMsb0JBQWUsR0FBWSxLQUFLLENBQUM7UUFDakMsWUFBTyxHQUFZLEtBQUssQ0FBQztRQUN6QixZQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUN2QixrQ0FBNkIsR0FBRyxDQUFDLENBQUM7UUFFbEMsd0NBQW1DLEdBQUcsS0FBSyxDQUFDO1FBSTFDLElBQUksQ0FBQyxJQUFJLEdBQUcsb0JBQW9CLEdBQUcsVUFBVSxDQUFDO1FBQzlDLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBQyxtQkFBbUIsRUFBRSxJQUFJLEVBQUMsQ0FBQztRQUM5QyxJQUFJLENBQUMsbUNBQW1DO1lBQ3BDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLHFDQUFxQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUM7SUFDL0UsQ0FBQztJQUVELDZEQUFpQyxHQUFqQztRQUNFLE9BQU8sSUFBSSxDQUFDLDZCQUE2QixHQUFHLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRUQsaURBQXFCLEdBQXJCO1FBQUEsaUJBWUM7UUFYQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLElBQUksSUFBSSxDQUFDLGtCQUFrQjtZQUNsRCxDQUFDLElBQUks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QUFDLHFCQUFxQixFQUFFLENBQUM7U0FDOUI7SUFDSCxDQUFDO0lBcklNLHdDQUFzQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQXNJdEUsd0JBQUM7Q0FBQSxBQXZJRCxJQXVJQztBQUVELG9FQUFvRTtBQUNwRSxzQkFBc0I7QUFDckIsSUFBWSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsaUJBQWlCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5jb25zdCBfZ2xvYmFsOiBhbnkgPVxuICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdyB8fCB0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcgJiYgc2VsZiB8fCBnbG9iYWw7XG5jbGFzcyBBc3luY1Rlc3Rab25lU3BlYyBpbXBsZW1lbnRzIFpvbmVTcGVjIHtcbiAgc3RhdGljIHN5bWJvbFBhcmVudFVucmVzb2x2ZWQgPSBab25lLl9fc3ltYm9sX18oJ3BhcmVudFVucmVzb2x2ZWQnKTtcblxuICBfcGVuZGluZ01pY3JvVGFza3M6IGJvb2xlYW4gPSBmYWxzZTtcbiAgX3BlbmRpbmdNYWNyb1Rhc2tzOiBib29sZWFuID0gZmFsc2U7XG4gIF9hbHJlYWR5RXJyb3JlZDogYm9vbGVhbiA9IGZhbHNlO1xuICBfaXNTeW5jOiBib29sZWFuID0gZmFsc2U7XG4gIHJ1blpvbmUgPSBab25lLmN1cnJlbnQ7XG4gIHVucmVzb2x2ZWRDaGFpbmVkUHJvbWlzZUNvdW50ID0gMDtcblxuICBzdXBwb3J0V2FpdFVucmVzb2x2ZWRDaGFpbmVkUHJvbWlzZSA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBmaW5pc2hDYWxsYmFjazogRnVuY3Rpb24sIHByaXZhdGUgZmFpbENhbGxiYWNrOiBGdW5jdGlvbiwgbmFtZVByZWZpeDogc3RyaW5nKSB7XG4gICAgdGhpcy5uYW1lID0gJ2FzeW5jVGVzdFpvbmUgZm9yICcgKyBuYW1lUHJlZml4O1xuICAgIHRoaXMucHJvcGVydGllcyA9IHsnQXN5bmNUZXN0Wm9uZVNwZWMnOiB0aGlzfTtcbiAgICB0aGlzLnN1cHBvcnRXYWl0VW5yZXNvbHZlZENoYWluZWRQcm9taXNlID1cbiAgICAgICAgX2dsb2JhbFtab25lLl9fc3ltYm9sX18oJ3N1cHBvcnRXYWl0VW5SZXNvbHZlZENoYWluZWRQcm9taXNlJyldID09PSB0cnVlO1xuICB9XG5cbiAgaXNVbnJlc29sdmVkQ2hhaW5lZFByb21pc2VQZW5kaW5nKCkge1xuICAgIHJldHVybiB0aGlzLnVucmVzb2x2ZWRDaGFpbmVkUHJvbWlzZUNvdW50ID4gMDtcbiAgfVxuXG4gIF9maW5pc2hDYWxsYmFja0lmRG9uZSgpIHtcbiAgICBpZiAoISh0aGlzLl9wZW5kaW5nTWljcm9UYXNrcyB8fCB0aGlzLl9wZW5kaW5nTWFjcm9UYXNrcyB8fFxuICAgICAgICAgICh0aGlzLnN1cHBvcnRXYWl0VW5yZXNvbHZlZENoYWluZWRQcm9taXNlICYmIHRoaXMuaXNVbnJlc29sdmVkQ2hhaW5lZFByb21pc2VQZW5kaW5nKCkpKSkge1xuICAgICAgLy8gV2UgZG8gdGhpcyBiZWNhdXNlIHdlIHdvdWxkIGxpa2UgdG8gY2F0Y2ggdW5oYW5kbGVkIHJlamVjdGVkIHByb21pc2VzLlxuICAgICAgdGhpcy5ydW5ab25lLnJ1bigoKSA9PiB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIGlmICghdGhpcy5fYWxyZWFkeUVycm9yZWQgJiYgISh0aGlzLl9wZW5kaW5nTWljcm9UYXNrcyB8fCB0aGlzLl9wZW5kaW5nTWFjcm9UYXNrcykpIHtcbiAgICAgICAgICAgIHRoaXMuZmluaXNoQ2FsbGJhY2soKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIDApO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcGF0Y2hQcm9taXNlRm9yVGVzdCgpIHtcbiAgICBpZiAoIXRoaXMuc3VwcG9ydFdhaXRVbnJlc29sdmVkQ2hhaW5lZFByb21pc2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcGF0Y2hQcm9taXNlRm9yVGVzdCA9IChQcm9taXNlIGFzIGFueSlbWm9uZS5fX3N5bWJvbF9fKCdwYXRjaFByb21pc2VGb3JUZXN0JyldO1xuICAgIGlmIChwYXRjaFByb21pc2VGb3JUZXN0KSB7XG4gICAgICBwYXRjaFByb21pc2VGb3JUZXN0KCk7XG4gICAgfVxuICB9XG5cbiAgdW5QYXRjaFByb21pc2VGb3JUZXN0KCkge1xuICAgIGlmICghdGhpcy5zdXBwb3J0V2FpdFVucmVzb2x2ZWRDaGFpbmVkUHJvbWlzZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB1blBhdGNoUHJvbWlzZUZvclRlc3QgPSAoUHJvbWlzZSBhcyBhbnkpW1pvbmUuX19zeW1ib2xfXygndW5QYXRjaFByb21pc2VGb3JUZXN0JyldO1xuICAgIGlmICh1blBhdGNoUHJvbWlzZUZvclRlc3QpIHtcbiAgICAgIHVuUGF0Y2hQcm9taXNlRm9yVGVzdCgpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFpvbmVTcGVjIGltcGxlbWVudGF0aW9uIGJlbG93LlxuXG4gIG5hbWU6IHN0cmluZztcblxuICBwcm9wZXJ0aWVzOiB7W2tleTogc3RyaW5nXTogYW55fTtcblxuICBvblNjaGVkdWxlVGFzayhkZWxlZ2F0ZTogWm9uZURlbGVnYXRlLCBjdXJyZW50OiBab25lLCB0YXJnZXQ6IFpvbmUsIHRhc2s6IFRhc2spOiBUYXNrIHtcbiAgICBpZiAodGFzay50eXBlICE9PSAnZXZlbnRUYXNrJykge1xuICAgICAgdGhpcy5faXNTeW5jID0gZmFsc2U7XG4gICAgfVxuICAgIGlmICh0YXNrLnR5cGUgPT09ICdtaWNyb1Rhc2snICYmIHRhc2suZGF0YSAmJiB0YXNrLmRhdGEgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAvLyBjaGVjayB3aGV0aGVyIHRoZSBwcm9taXNlIGlzIGEgY2hhaW5lZCBwcm9taXNlXG4gICAgICBpZiAoKHRhc2suZGF0YSBhcyBhbnkpW0FzeW5jVGVzdFpvbmVTcGVjLnN5bWJvbFBhcmVudFVucmVzb2x2ZWRdID09PSB0cnVlKSB7XG4gICAgICAgIC8vIGNoYWluZWQgcHJvbWlzZSBpcyBiZWluZyBzY2hlZHVsZWRcbiAgICAgICAgdGhpcy51bnJlc29sdmVkQ2hhaW5lZFByb21pc2VDb3VudC0tO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGVsZWdhdGUuc2NoZWR1bGVUYXNrKHRhcmdldCwgdGFzayk7XG4gIH1cblxuICBvbkludm9rZVRhc2soXG4gICAgICBkZWxlZ2F0ZTogWm9uZURlbGVnYXRlLCBjdXJyZW50OiBab25lLCB0YXJnZXQ6IFpvbmUsIHRhc2s6IFRhc2ssIGFwcGx5VGhpczogYW55LFxuICAgICAgYXBwbHlBcmdzOiBhbnkpIHtcbiAgICBpZiAodGFzay50eXBlICE9PSAnZXZlbnRUYXNrJykge1xuICAgICAgdGhpcy5faXNTeW5jID0gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBkZWxlZ2F0ZS5pbnZva2VUYXNrKHRhcmdldCwgdGFzaywgYXBwbHlUaGlzLCBhcHBseUFyZ3MpO1xuICB9XG5cbiAgb25DYW5jZWxUYXNrKGRlbGVnYXRlOiBab25lRGVsZWdhdGUsIGN1cnJlbnQ6IFpvbmUsIHRhcmdldDogWm9uZSwgdGFzazogVGFzaykge1xuICAgIGlmICh0YXNrLnR5cGUgIT09ICdldmVudFRhc2snKSB7XG4gICAgICB0aGlzLl9pc1N5bmMgPSBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGRlbGVnYXRlLmNhbmNlbFRhc2sodGFyZ2V0LCB0YXNrKTtcbiAgfVxuXG4gIC8vIE5vdGUgLSB3ZSBuZWVkIHRvIHVzZSBvbkludm9rZSBhdCB0aGUgbW9tZW50IHRvIGNhbGwgZmluaXNoIHdoZW4gYSB0ZXN0IGlzXG4gIC8vIGZ1bGx5IHN5bmNocm9ub3VzLiBUT0RPKGp1bGllbXIpOiByZW1vdmUgdGhpcyB3aGVuIHRoZSBsb2dpYyBmb3JcbiAgLy8gb25IYXNUYXNrIGNoYW5nZXMgYW5kIGl0IGNhbGxzIHdoZW5ldmVyIHRoZSB0YXNrIHF1ZXVlcyBhcmUgZGlydHkuXG4gIC8vIHVwZGF0ZWQgYnkoSmlhTGlQYXNzaW9uKSwgb25seSBjYWxsIGZpbmlzaCBjYWxsYmFjayB3aGVuIG5vIHRhc2tcbiAgLy8gd2FzIHNjaGVkdWxlZC9pbnZva2VkL2NhbmNlbGVkLlxuICBvbkludm9rZShcbiAgICAgIHBhcmVudFpvbmVEZWxlZ2F0ZTogWm9uZURlbGVnYXRlLCBjdXJyZW50Wm9uZTogWm9uZSwgdGFyZ2V0Wm9uZTogWm9uZSwgZGVsZWdhdGU6IEZ1bmN0aW9uLFxuICAgICAgYXBwbHlUaGlzOiBhbnksIGFwcGx5QXJncz86IGFueVtdLCBzb3VyY2U/OiBzdHJpbmcpOiBhbnkge1xuICAgIGxldCBwcmV2aW91c1Rhc2tDb3VudHM6IGFueSA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuX2lzU3luYyA9IHRydWU7XG4gICAgICByZXR1cm4gcGFyZW50Wm9uZURlbGVnYXRlLmludm9rZSh0YXJnZXRab25lLCBkZWxlZ2F0ZSwgYXBwbHlUaGlzLCBhcHBseUFyZ3MsIHNvdXJjZSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGNvbnN0IGFmdGVyVGFza0NvdW50czogYW55ID0gKHBhcmVudFpvbmVEZWxlZ2F0ZSBhcyBhbnkpLl90YXNrQ291bnRzO1xuICAgICAgaWYgKHRoaXMuX2lzU3luYykge1xuICAgICAgICB0aGlzLl9maW5pc2hDYWxsYmFja0lmRG9uZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG9uSGFuZGxlRXJyb3IocGFyZW50Wm9uZURlbGVnYXRlOiBab25lRGVsZWdhdGUsIGN1cnJlbnRab25lOiBab25lLCB0YXJnZXRab25lOiBab25lLCBlcnJvcjogYW55KTpcbiAgICAgIGJvb2xlYW4ge1xuICAgIC8vIExldCB0aGUgcGFyZW50IHRyeSB0byBoYW5kbGUgdGhlIGVycm9yLlxuICAgIGNvbnN0IHJlc3VsdCA9IHBhcmVudFpvbmVEZWxlZ2F0ZS5oYW5kbGVFcnJvcih0YXJnZXRab25lLCBlcnJvcik7XG4gICAgaWYgKHJlc3VsdCkge1xuICAgICAgdGhpcy5mYWlsQ2FsbGJhY2soZXJyb3IpO1xuICAgICAgdGhpcy5fYWxyZWFkeUVycm9yZWQgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBvbkhhc1Rhc2soZGVsZWdhdGU6IFpvbmVEZWxlZ2F0ZSwgY3VycmVudDogWm9uZSwgdGFyZ2V0OiBab25lLCBoYXNUYXNrU3RhdGU6IEhhc1Rhc2tTdGF0ZSkge1xuICAgIGRlbGVnYXRlLmhhc1Rhc2sodGFyZ2V0LCBoYXNUYXNrU3RhdGUpO1xuICAgIGlmIChoYXNUYXNrU3RhdGUuY2hhbmdlID09ICdtaWNyb1Rhc2snKSB7XG4gICAgICB0aGlzLl9wZW5kaW5nTWljcm9UYXNrcyA9IGhhc1Rhc2tTdGF0ZS5taWNyb1Rhc2s7XG4gICAgICB0aGlzLl9maW5pc2hDYWxsYmFja0lmRG9uZSgpO1xuICAgIH0gZWxzZSBpZiAoaGFzVGFza1N0YXRlLmNoYW5nZSA9PSAnbWFjcm9UYXNrJykge1xuICAgICAgdGhpcy5fcGVuZGluZ01hY3JvVGFza3MgPSBoYXNUYXNrU3RhdGUubWFjcm9UYXNrO1xuICAgICAgdGhpcy5fZmluaXNoQ2FsbGJhY2tJZkRvbmUoKTtcbiAgICB9XG4gIH1cbn1cblxuLy8gRXhwb3J0IHRoZSBjbGFzcyBzbyB0aGF0IG5ldyBpbnN0YW5jZXMgY2FuIGJlIGNyZWF0ZWQgd2l0aCBwcm9wZXJcbi8vIGNvbnN0cnVjdG9yIHBhcmFtcy5cbihab25lIGFzIGFueSlbJ0FzeW5jVGVzdFpvbmVTcGVjJ10gPSBBc3luY1Rlc3Rab25lU3BlYztcbiJdfQ==