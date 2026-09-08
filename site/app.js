const output = document.querySelector('#console-output');
const form = document.querySelector('#console-form');
const input = document.querySelector('#console-input');

const responses = {
  help: 'COMMANDS\n  help           show commands\n  architecture   show the semantic stack\n  status         show runtime state\n  clear          clear the console',
  architecture: 'ARCHITECTURE\n  MCP      interaction membrane\n  RDF      semantic graph substrate\n  LCT      witnessed presence\n  T3/V3    trust + value tensors\n  MRH      relevance boundary\n  ATP/ADP  allocation + discharge',
  status: 'STATUS\n  dashboard   ONLINE\n  protocol    ROUTE → INSTRUCT → VERIFY → RESULT\n  mode        static / dependency-free\n  source      auraecosystem/web4.0'
};

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const command = input.value.trim().toLowerCase();
  if (!command) return;
  if (command === 'clear') output.textContent = '';
  else output.textContent = `${responses[command] ?? `Unknown command: ${command}. Type "help" for available commands.`}`;
  input.value = '';
});
