/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * This property will be monkey-patched on elements, components and directives
 */
export var MONKEY_PATCH_KEY_NAME = '__ngContext__';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvaW50ZXJmYWNlcy9jb250ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQU1IOztHQUVHO0FBQ0gsTUFBTSxDQUFDLElBQU0scUJBQXFCLEdBQUcsZUFBZSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5cbmltcG9ydCB7UkVsZW1lbnR9IGZyb20gJy4vcmVuZGVyZXInO1xuaW1wb3J0IHtMVmlld0RhdGF9IGZyb20gJy4vdmlldyc7XG5cbi8qKlxuICogVGhpcyBwcm9wZXJ0eSB3aWxsIGJlIG1vbmtleS1wYXRjaGVkIG9uIGVsZW1lbnRzLCBjb21wb25lbnRzIGFuZCBkaXJlY3RpdmVzXG4gKi9cbmV4cG9ydCBjb25zdCBNT05LRVlfUEFUQ0hfS0VZX05BTUUgPSAnX19uZ0NvbnRleHRfXyc7XG5cbi8qKlxuICogVGhlIGludGVybmFsIHZpZXcgY29udGV4dCB3aGljaCBpcyBzcGVjaWZpYyB0byBhIGdpdmVuIERPTSBlbGVtZW50LCBkaXJlY3RpdmUgb3JcbiAqIGNvbXBvbmVudCBpbnN0YW5jZS4gRWFjaCB2YWx1ZSBpbiBoZXJlIChiZXNpZGVzIHRoZSBMVmlld0RhdGEgYW5kIGVsZW1lbnQgbm9kZSBkZXRhaWxzKVxuICogY2FuIGJlIHByZXNlbnQsIG51bGwgb3IgdW5kZWZpbmVkLiBJZiB1bmRlZmluZWQgdGhlbiBpdCBpbXBsaWVzIHRoZSB2YWx1ZSBoYXMgbm90IGJlZW5cbiAqIGxvb2tlZCB1cCB5ZXQsIG90aGVyd2lzZSwgaWYgbnVsbCwgdGhlbiBhIGxvb2t1cCB3YXMgZXhlY3V0ZWQgYW5kIG5vdGhpbmcgd2FzIGZvdW5kLlxuICpcbiAqIEVhY2ggdmFsdWUgd2lsbCBnZXQgZmlsbGVkIHdoZW4gdGhlIHJlc3BlY3RpdmUgdmFsdWUgaXMgZXhhbWluZWQgd2l0aGluIHRoZSBnZXRDb250ZXh0XG4gKiBmdW5jdGlvbi4gVGhlIGNvbXBvbmVudCwgZWxlbWVudCBhbmQgZWFjaCBkaXJlY3RpdmUgaW5zdGFuY2Ugd2lsbCBzaGFyZSB0aGUgc2FtZSBpbnN0YW5jZVxuICogb2YgdGhlIGNvbnRleHQuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTENvbnRleHQge1xuICAvKipcbiAgICogVGhlIGNvbXBvbmVudCdzIHBhcmVudCB2aWV3IGRhdGEuXG4gICAqL1xuICBsVmlld0RhdGE6IExWaWV3RGF0YTtcblxuICAvKipcbiAgICogVGhlIGluZGV4IGluc3RhbmNlIG9mIHRoZSBub2RlLlxuICAgKi9cbiAgbm9kZUluZGV4OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFRoZSBpbnN0YW5jZSBvZiB0aGUgRE9NIG5vZGUgdGhhdCBpcyBhdHRhY2hlZCB0byB0aGUgbE5vZGUuXG4gICAqL1xuICBuYXRpdmU6IFJFbGVtZW50O1xuXG4gIC8qKlxuICAgKiBUaGUgaW5zdGFuY2Ugb2YgdGhlIENvbXBvbmVudCBub2RlLlxuICAgKi9cbiAgY29tcG9uZW50OiB7fXxudWxsfHVuZGVmaW5lZDtcblxuICAvKipcbiAgICogVGhlIGxpc3Qgb2YgYWN0aXZlIGRpcmVjdGl2ZXMgdGhhdCBleGlzdCBvbiB0aGlzIGVsZW1lbnQuXG4gICAqL1xuICBkaXJlY3RpdmVzOiBhbnlbXXxudWxsfHVuZGVmaW5lZDtcblxuICAvKipcbiAgICogVGhlIG1hcCBvZiBsb2NhbCByZWZlcmVuY2VzIChsb2NhbCByZWZlcmVuY2UgbmFtZSA9PiBlbGVtZW50IG9yIGRpcmVjdGl2ZSBpbnN0YW5jZSkgdGhhdCBleGlzdFxuICAgKiBvbiB0aGlzIGVsZW1lbnQuXG4gICAqL1xuICBsb2NhbFJlZnM6IHtba2V5OiBzdHJpbmddOiBhbnl9fG51bGx8dW5kZWZpbmVkO1xufVxuIl19