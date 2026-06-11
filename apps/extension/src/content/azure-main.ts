// Runs in the PAGE's JS context (world: "MAIN") so it can access window.monaco.
// Communicates with the isolated-world azure.ts via window.postMessage.

interface MonacoModel {
  uri: { toString(): string };
  getLineCount(): number;
  getValue(): string;
}

interface WindowWithMonaco extends Window {
  monaco?: { editor?: { getModels?(): MonacoModel[] } };
}

window.addEventListener("message", (e) => {
  if (e.source !== window || e.data?.type !== "GITPILOT_READ_MONACO") return;

  const { requestId } = e.data as { requestId: string };
  const deadline = Date.now() + 4000;

  const poll = () => {
    const monaco = (window as WindowWithMonaco).monaco;
    const models: MonacoModel[] = monaco?.editor?.getModels?.() ?? [];
    const fileModels = models.filter((m) => m.getLineCount() > 10);
    const isOrig = (m: MonacoModel) =>
      /inmemory:\/\/model\/\d+$/.test(m.uri.toString());
    const orig = fileModels.find(isOrig);
    const mod = fileModels.find((m) => !isOrig(m));

    const hasData = orig && mod && orig.getValue() !== mod.getValue();
    if (hasData || Date.now() > deadline) {
      window.postMessage(
        {
          type: "GITPILOT_MONACO_RESULT",
          requestId,
          origVal: orig?.getValue() ?? null,
          modVal: mod?.getValue() ?? null,
        },
        "*",
      );
    } else {
      setTimeout(poll, 150);
    }
  };

  // Give the tab switch time to render the diff editor
  setTimeout(poll, 300);
});
