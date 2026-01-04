import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { numberToIndonesianText } from "@/lib/utils/number-to-text"

// Register fonts if needed, otherwise use standard fonts
// Font.register({ family: 'Inter', src: '...' });

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#000'
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    headerSubtitle: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        textTransform: 'uppercase',
    },
    infoContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    infoColumn: {
        width: '45%',
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    infoLabel: {
        width: 100,
        fontWeight: 'bold',
    },
    infoSeparator: {
        width: 10,
        textAlign: 'center'
    },
    infoValue: {
        flex: 1,
    },
    table: {
        display: 'flex',
        width: 'auto',
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderStyle: 'solid',
        borderColor: '#000',
        marginBottom: 20
    },
    tableRow: {
        margin: 'auto',
        flexDirection: 'row',
        minHeight: 25,
        // Removed alignItems: center to allow stretch
    },
    tableHeaderRow: {
        backgroundColor: '#e5e5e5', // Light gray for header
        fontWeight: 'bold',
        textAlign: 'center',
    },
    // Column Widths - Added borderBottomWidth to all cells
    colNo: { width: '5%', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#000', padding: 4, textAlign: 'center' },
    colKomponen: { width: '35%', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#000', padding: 4 },
    colNilaiAngka: { width: '10%', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#000', padding: 4, textAlign: 'center' },
    colNilaiHuruf: { width: '25%', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#000', padding: 4, textAlign: 'left' },
    colKetercapaian: { width: '25%', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#000', padding: 4, textAlign: 'center' },

    // Cell styles
    cellText: { fontSize: 9 },
    cellTextBold: { fontSize: 9, fontWeight: 'bold' },

    signatureSection: {
        marginTop: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    signatureBlock: {
        width: '30%',
        alignItems: 'center',
    },
    dateLine: {
        textAlign: 'right',
        marginBottom: 10,
        marginRight: 40
    },
    signatureName: {
        marginTop: 50,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        paddingBottom: 2,
        fontWeight: 'bold',
    },
    signatureRole: {
        fontSize: 9,
        marginTop: 2
    }
});

interface ReportCardDocumentProps {
    student: any
    classData: any
    courses: any[]
}

export const ReportCardDocument = ({ student, classData, courses }: ReportCardDocumentProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <Text style={styles.headerTitle}>LAPORAN HASIL BELAJAR</Text>
            <Text style={styles.headerSubtitle}>SEMESTER {classData.term.type === 'ODD' ? '1 (SATU)' : '2 (DUA)'}</Text>

            {/* Student Info */}
            <View style={styles.infoContainer}>
                <View style={styles.infoColumn}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Nama</Text>
                        <Text style={styles.infoSeparator}>:</Text>
                        <Text style={styles.infoValue}>{student.name.toUpperCase()}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Nomor Induk</Text>
                        <Text style={styles.infoSeparator}>:</Text>
                        <Text style={styles.infoValue}>{student.officialId || '-'}</Text>
                    </View>
                </View>
                <View style={styles.infoColumn}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Kelas</Text>
                        <Text style={styles.infoSeparator}>:</Text>
                        <Text style={styles.infoValue}>{classData.name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Semester</Text>
                        <Text style={styles.infoSeparator}>:</Text>
                        <Text style={styles.infoValue}>{classData.term.type === 'ODD' ? '1 (Satu)' : '2 (Dua)'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Tahun Pelajaran</Text>
                        <Text style={styles.infoSeparator}>:</Text>
                        <Text style={styles.infoValue}>{classData.term.academicYear?.name}</Text>
                    </View>
                </View>
            </View>

            {/* Table */}
            <View style={styles.table}>
                {/* Header Row */}
                <View style={[styles.tableRow, styles.tableHeaderRow]}>
                    <Text style={styles.colNo}>No.</Text>
                    <Text style={styles.colKomponen}>MATA PELAJARAN</Text>
                    <Text style={styles.colNilaiAngka}>Nilai (Angka)</Text>
                    <Text style={styles.colNilaiHuruf}>Nilai (Huruf)</Text>
                    <Text style={styles.colKetercapaian}>Ketercapaian Kompetensi</Text>
                </View>

                {courses.map((course, i) => {
                    let ketercapaian = "";
                    if (course.grade > 85) ketercapaian = "Terlampaui";
                    else if (course.grade >= 75) ketercapaian = "Tercapai"; // Default KKM 75
                    else ketercapaian = "Tidak Tercapai";

                    return (
                        <View key={i} style={styles.tableRow}>
                            <Text style={styles.colNo}>{i + 1}</Text>
                            <Text style={styles.colKomponen}>{course.name}</Text>
                            <Text style={styles.colNilaiAngka}>{course.grade}</Text>
                            <Text style={styles.colNilaiHuruf}>{numberToIndonesianText(Math.round(course.grade))}</Text>
                            <Text style={[styles.colKetercapaian, { fontStyle: 'italic', fontSize: 8 }]}>{ketercapaian}</Text>
                        </View>
                    );
                })}
            </View>


        </Page>
    </Document>
);
