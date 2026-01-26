import { useToast } from "./useToast";
import { useI18n } from "vue-i18n";

/**
 * Composable that provides common I/O utilities for graph data: downloading files,
 * copying text to the clipboard, and reading local files as text.
 *
 * Remarks:
 * - copyToClipboard relies on navigator.clipboard.writeText and may be subject to user permissions
 *
 * @returns An object with the following methods:
 * - downloadFile(content: string, filename: string, extension: string, mimeType: string): void
 *   Triggers a client-side download of `content` as a file named `${filename}.${extension}`
 *   with the provided MIME type. Shows a success toast when the download is initiated.
 *
 * - copyToClipboard(content: string, formatName: string): Promise<void>
 *   Attempts to copy `content` to the clipboard. On success, shows a success toast that includes
 *   `formatName`; on failure, shows an error toast. Rejects if the clipboard API call fails.
 *
 * - readFileContent(file: File): Promise<string>
 *   Reads the given File as UTF-8 text and resolves with the file's contents. Rejects on read errors.
 *
 * @example
 * const { downloadFile, copyToClipboard, readFileContent } = useGraphIO();
 * await copyToClipboard(jsonString, "Graph JSON");
 * downloadFile(jsonString, "my-graph", "json", "application/json");
 */
export function useGraphIO() {
	const { triggerToast } = useToast();
	const { t } = useI18n();

	// Export (file) option
	const downloadFile = (
		content: string,
		filename: string,
		extension: string,
		mimeType: string
	) => {
		// Create a temporary link to trigger the download
		const blob = new Blob([content], { type: mimeType });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");

		// Set link attributes
		link.href = url;
		link.download = `${filename}.${extension}`;

		// Trigger the download
		document.body.appendChild(link);
		link.click();

		// Clean up
		document.body.removeChild(link);
		URL.revokeObjectURL(url);

		// Notify user
		triggerToast({
			title: t('graphIO.exportToast', { ext: extension }),
			severity: "success",
		});
	};

	// Export (copy) option
	const copyToClipboard = async (content: string, formatName: string) => {
		try {
			await navigator.clipboard.writeText(content);
			triggerToast({
				title: t('graphIO.copyToast', { format: formatName }),
				severity: "success",
			});
		} catch (err) {
			triggerToast({ title: t('graphIO.copyError'), severity: "error" });
		}
	};

	// Import option
	const readFileContent = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (e) => resolve(e.target?.result as string);
			reader.onerror = (e) => reject(e);
			reader.readAsText(file);
		});
	};

	return { downloadFile, copyToClipboard, readFileContent };
}
