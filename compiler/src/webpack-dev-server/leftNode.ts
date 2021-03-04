export const leftNode = `
<button id="button" lang="cn" hidden="{{false}}">
    <button wx:for="{{[1,2,3]}}" wx:for-item="item">
        <button>{{item}}</button>
    </button>
    <button wx:if="{{a}}">
        <button >456 </button>
        <button >123 </button>
    </button>
    <button wx:else>
        <button >123 </button>
        <button > 456</button>
    </button>
</button>
`;

module.exports = leftNode;