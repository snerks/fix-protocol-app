import { useState, useEffect } from 'react';
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import fix40 from './fix-protocol-dictionary-json/fix40/fix40.json';
import fix41 from './fix-protocol-dictionary-json/fix41/fix41.json';
import fix42 from './fix-protocol-dictionary-json/fix42/fix42.json';
import fix43 from './fix-protocol-dictionary-json/fix43/fix43.json';
import fix44 from './fix-protocol-dictionary-json/fix44/fix44.json';
import fix50 from './fix-protocol-dictionary-json/fix50/fix50.json';
import fix50sp1 from './fix-protocol-dictionary-json/fix50-sp1/fix50-sp1.json';
import fix50sp2 from './fix-protocol-dictionary-json/fix50-sp2/fix50-sp2.json';
import fixt11 from './fix-protocol-dictionary-json/fixt11/fixt11.json';
import { useColorMode } from './ColorModeContext';
import fieldValueDecodes from './FieldValueDecodes.json';

const FIX_MSG_TYPES: Record<string, string> = { 'A': 'Logon', '0': 'Heartbeat', '1': 'Test Request', '2': 'Resend Request', '3': 'Reject', '4': 'Sequence Reset', '5': 'Logout', '6': 'Indication of Interest', '7': 'Advertisement', '8': 'Execution Report', '9': 'Order Cancel Reject', 'D': 'New Order - Single', 'G': 'Order Cancel Request', 'H': 'Order Cancel/Replace Request' };

function getDictionaryByVersion(version: string) {
    switch (version) {
        case 'FIX.4.0': return fix40;
        case 'FIX.4.1': return fix41;
        case 'FIX.4.2': return fix42;
        case 'FIX.4.3': return fix43;
        case 'FIX.4.4': return fix44;
        case 'FIX.5.0': return fix50;
        case 'FIX.5.0SP1': return fix50sp1;
        case 'FIX.5.0SP2': return fix50sp2;
        case 'FIXT.1.1': return fixt11;
        default: return fix44;
    }
}

// Update decodeFIXMessage to accept delimiter as argument
function decodeFIXMessage(message: string, delimiter?: '|' | '\u0001') {
    if (!message) {
        throw new Error('Input message cannot be empty.');
    }


    const delim = delimiter || (message.includes('|') ? '|' : '\u0001');
    // Escape delimiter for regex if needed
    const regexDelim = delim === '|' ? '\\|' : delim;
    // Remove trailing delimiter and whitespace
    const pairs = message.trim().replace(new RegExp(`${regexDelim}+$`), '').split(delim).filter(Boolean);
    let version = 'FIX.4.4';
    for (const pair of pairs) {
        const [tag, value] = pair.split('=');
        if (tag === '8' && value) {
            version = value.trim();
            break;
        }
    }
    const dict = getDictionaryByVersion(version);
    const FIX_TAGS: Record<string, string> = Object.fromEntries(
        dict.Fields.map((def: any) => [String(def.Tag), def.Name])
    );
    return pairs.map(pair => {
        const [tag, value] = pair.split('=');
        let tagName = FIX_TAGS[tag] || `Tag ${tag} (*)`;
        // Special handling for MsgType (tag 35)
        if (tag === '35' && value && FIX_MSG_TYPES[value]) {
            tagName = `MsgType (${FIX_MSG_TYPES[value]})`;
        }
        return { tag, tagName, value };
    });
}

export function FixDecoder() {
    const sampleMessage = "8=FIX.4.4|9=148|35=D|34=1080|49=TESTBUY1|52=20180920-18:14:19.508|56=TESTSELL1|11=636730640278898634|15=USD|21=2|38=7000|40=1|54=1|55=MSFT|60=20180920-18:14:19.492|10=092";

    const [input, setInput] = useState(() => localStorage.getItem('fixInput') || sampleMessage);
    const [decoded, setDecoded] = useState<Array<{ tag: string, tagName: string, value: string }>>([]);
    const [decodeError, setDecodeError] = useState<string | null>(null);
    const [delimiter, setDelimiter] = useState<'|' | '\u0001'>(() => '\u0001');
    const { mode } = useColorMode();

    // Save input to localStorage on change
    // Detect delimiter on paste or input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInput(value);
        localStorage.setItem('fixInput', value);
        setDecodeError(null); // Clear error on input change
        // Detect delimiter: prefer SOH if present, else pipe
        if (value.includes('\u0001') || value.includes(String.fromCharCode(1))) {
            setDelimiter('\u0001');
        } else if (value.includes('|')) {
            setDelimiter('|');
        }
    };

    const handleDecode = () => {
        try {
            const result = decodeFIXMessage(input, delimiter);
            setDecoded(result);
            setDecodeError(null);
        } catch (err: any) {
            setDecoded([]);
            setDecodeError(err?.message || 'An error occurred during decoding.');
        }
    };

    const handleDelimiterToggle = () => {
        const newDelimiter = delimiter === '|' ? '\u0001' : '|';
        // Replace all current delimiters in the input with the new one
        const currentDelim = delimiter;
        let updatedInput = input;
        if (currentDelim === '|') {
            // Replace all | with SOH
            updatedInput = input.replace(/\|/g, '\u0001');
        } else {
            // Replace all SOH with |
            updatedInput = input.replace(/\u0001/g, '|');
        }
        setDelimiter(newDelimiter);
        setInput(updatedInput);
        localStorage.setItem('fixInput', updatedInput);
    };

    // Helper for showing delimiter name
    const delimiterLabel = delimiter === '|' ? 'Pipe (|)' : 'SOH (ASCII 0x01)';

    // Save theme preference to localStorage when mode changes
    useEffect(() => {
        localStorage.setItem('themeMode', mode);
    }, [mode]);

    return (
        <Box maxWidth={1200} mx="auto" mt={4} px={1}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    FIX Protocol Decoder
                </Typography>
                <Box mb={2} display="flex" alignItems="center" gap={2}>
                    <Typography variant="body2">Delimiter:</Typography>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={handleDelimiterToggle}
                    >
                        {delimiterLabel}
                    </Button>
                </Box>
                <TextField
                    label="FIX Message"
                    multiline
                    minRows={4}
                    fullWidth
                    variant="outlined"
                    placeholder={
                        delimiter === '|'
                            ? 'Enter FIX message (e.g. 8=FIX.4.2|9=12|35=A|...)'
                            : 'Enter FIX message (e.g. 8=FIX.4.2\u00019=12\u000135=A...)'
                    }
                    value={input}
                    onChange={handleInputChange}
                    sx={{ fontFamily: 'monospace', mb: 2 }}
                />
                <Button variant="contained" onClick={handleDecode} sx={{ mb: 2 }}>
                    Decode
                </Button>
                {decodeError && (
                    <Typography color="error" sx={{ mt: 1, mb: 2 }}>
                        {decodeError}
                    </Typography>
                )}
                {decoded.length > 0 && !decodeError && (
                    <TableContainer component={Paper} sx={{ mt: 2, width: '100%', overflowX: 'auto' }}>
                        <Typography variant="h6" sx={{ p: 2, pb: 0 }}>
                            {(() => {
                                const msgTypeField = decoded.find(field => field.tag === '35');
                                const msgTypeValue = msgTypeField?.value;
                                // const msgTypeName = msgTypeValue && FIX_MSG_TYPES[msgTypeValue];
                                let decodedMessageTypeName = '';
                                // Tag is string, but keys in fieldById are stringified numbers
                                const fieldDef = (fieldValueDecodes.fieldById as Record<string, any>)[35];
                                if (msgTypeValue && fieldDef && fieldDef.values && msgTypeValue in fieldDef.values) {
                                    decodedMessageTypeName = fieldDef.values[msgTypeValue];
                                }
                                return decodedMessageTypeName
                                    ? `${decodedMessageTypeName}`
                                    : 'Unknown Message Type';
                            })()}
                        </Typography>
                        <Typography variant="body2" sx={{ p: 2, pt: 0, color: 'text.secondary' }}>
                            * means the tag is not known in this FIX version
                        </Typography>
                        <Table size="small" sx={{ minWidth: 700 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Tag</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Value</TableCell>
                                    <TableCell>Decoded Value</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {decoded.map(({ tag, tagName, value }) => {
                                    if (tag === '828') {
                                        console.log('TrdType');
                                    }

                                    let decodedValue = '';
                                    // Tag is string, but keys in fieldById are stringified numbers
                                    const fieldDef = (fieldValueDecodes.fieldById as Record<string, any>)[tag];

                                    const fieldHasValues = fieldDef && fieldDef.values && Object.keys(fieldDef.values).length > 0;

                                    // if (fieldDef && fieldDef.values && value in fieldDef.values) {
                                    //     decodedValue = fieldDef.values[value] || `Unknown value for tag ${tag}`;
                                    // }

                                    // decodedValue = fieldHasValues ? value in fieldDef.values ? fieldDef.values[value] : `Unknown value for tag ${tag}` : value;

                                    if (fieldHasValues) {
                                        decodedValue = value in fieldDef.values ? fieldDef.values[value] : `Unknown value for tag ${tag}`;
                                    }

                                    const tagNameNotKnownInThisVersion = tagName.includes('*');
                                    const tagNameTooltip = tagNameNotKnownInThisVersion ? `Tag ${tag} is not known in this FIX version` : '';

                                    const tagNameToUse = tagName.includes('*') ? `${fieldDef.name} (*)` : tagName;

                                    return (
                                        <TableRow key={tag + value}>
                                            <TableCell>{tag}</TableCell>
                                            <TableCell title={tagNameTooltip}>{tagNameToUse}</TableCell>
                                            <TableCell sx={{ fontFamily: 'monospace' }}>{value}</TableCell>
                                            <TableCell>{decodedValue}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Box>
    );
}
