declare module 'google-spreadsheet' {
    interface ServiceAccountCredentials {
        client_email: string;
        private_key: string;
    }

    interface GoogleSpreadsheetRow {
        [key: string]: string | number | null | undefined;
    }

    interface GoogleSpreadsheetWorksheet {
        getRows(): Promise<GoogleSpreadsheetRow[]>;
        addRow(row: (string | number)[] | Record<string, string | number>): Promise<GoogleSpreadsheetRow>;
    }

    class GoogleSpreadsheet {
        constructor(sheetId: string);
        useServiceAccountAuth(credentials: ServiceAccountCredentials): Promise<void>;
        loadInfo(): Promise<void>;
        sheetsByTitle: Record<string, GoogleSpreadsheetWorksheet>;
    }
}
