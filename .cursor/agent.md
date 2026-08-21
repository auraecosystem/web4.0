---
description: Generate an implementation plan
tools: ['search', 'web']
handoffs:
  - label: Start Implementation
    agent: implementation
    prompt: Now implement the plan outlined above.
    send: false
    model: GPT-5.5 (copilot)
---
<label for="fruits">Fruits</label>
<select id="fruits" name="fruits" data-placeholder="Select fruits" multiple data-multi-select>
    <option value="Apple">Apple</option>
    <option value="Banana">Banana</option>
    <option value="Blackberry">Blackberry</option>
    <option value="Blueberry">Blueberry</option>
    <option value="Cherry">Cherry</option>
    <option value="Cranberry">Cranberry</option>
    <option value="Grapes">Grapes</option>
    <option value="Kiwi">Kiwi</option>
    <option value="Mango">Mango</option>
    <option value="Orange">Orange</option>
    <option value="Peach">Peach</option>
    <option value="Pear">Pear</option>
    <option value="Pineapple">Pineapple</option>
    <option value="Raspberry">Raspberry</option>
    <option value="Strawberry">Strawberry</option>
    <option value="Watermelon">Watermelon</option>
</select>
<script>
// Initialize the Multi Select dropdown
new MultiSelect('#dynamic', {
    data:[
        {
            value: 'opt1',
            text: 'Option 1'
        },
        {
            value: 'opt2',
            html: '<strong>Option 2 with HTML!</strong>'
        },
        {
            value: 'opt3',
            text: 'Option 3',
            selected: true
        },
        {
            value: 'opt4',
            text: 'Option 4'
        },
        {
            value: 'opt5',
            text: 'Option 5'
        }
    ],
    placeholder: 'Select an option',
    search: true,
    selectAll: true,
    listAll: false,
    disabled: false,
    min: 1,
    max: 2
});
</script>
