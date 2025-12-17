import React, { useContext, useState } from "react";
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ThemeContext } from "../context/ThemeProvider";
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from "react-native-responsive-dimensions";
import Icon from "../utils/Icon";
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const CustomDatePicker = ({ visible = true, setDate, date, onCancel }: { visible: boolean, date: Date, setDate?: (text: string) => void, onCancel: () => void }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date>(date || new Date());
    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };
    const generateCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const totalDays = getDaysInMonth(month, year);

        const daysArray = Array(firstDay).fill(null).concat(
            Array.from({ length: totalDays }, (_, i) => i + 1)
        );
        return daysArray;
    };
    const handlePrev = () => {
        const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        setCurrentDate(prevMonth);
    };
    const handleNext = () => {
        const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        setCurrentDate(nextMonth);
    };
    const { colors  } = useContext(ThemeContext);
    return (
        <Modal visible={visible} transparent >
            <View style={{ flex: 1, backgroundColor: colors.transparent,  position: "absolute", height: "100%", width: "100%", zIndex: -1 }}>
            </View>
            <View style={{ position: "relative", zIndex: 1, flex: 1, justifyContent: "center", }}>
                <View style={{ backgroundColor: colors.background }}>
                    <View style={{ backgroundColor: colors.primary, paddingHorizontal: responsiveScreenWidth(2), paddingVertical: responsiveScreenHeight(1.5) }}>
                        <Text style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "500", color: colors.background }}>{selectedDate.getFullYear()}</Text>
                        <Text style={{ fontSize: responsiveScreenFontSize(3), fontWeight: "500", color: colors.background }}>{DAYS[selectedDate.getDay()]}, {currentDate.toLocaleString('default', { month: 'short' })} {currentDate.getFullYear()} </Text>
                    </View>
                    <View style={styles.header}>
                        <Icon icon={{ type: "FontAwesome", name: "angle-left" }} style={[styles.nav, { color: colors.textPrimary }]} onPress={handlePrev} />
                        <Text style={[styles.month, { color: colors.textPrimary }]}>
                            {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
                        </Text>
                        <Icon icon={{ type: "FontAwesome", name: "angle-right" }} style={[styles.nav, { color: colors.textPrimary }]} onPress={handleNext} />
                    </View>
                    <View style={styles.weekdays}>
                        {DAYS.map(day => (
                            <Text key={day} style={[styles.dayLabel, { color: colors.textSecondary }]}>{day}</Text>
                        ))}
                    </View>
                    <FlatList
                        data={generateCalendar()}
                        numColumns={7}
                        keyExtractor={(_, index) => index.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.day,
                                ]}
                                disabled={!item}
                                onPress={() => {
                                    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), item!));
                                }}
                            >
                                <View style={[styles.dayText, item === selectedDate?.getDate() &&
                                    currentDate.getMonth() === selectedDate?.getMonth() &&
                                    currentDate.getFullYear() === selectedDate?.getFullYear()
                                    ? { backgroundColor: colors.primary, borderRadius: 100, }
                                    : {}]}><Text style={{
                                        fontWeight: "500", fontSize: responsiveScreenFontSize(1.8), color: item === selectedDate?.getDate() &&
                                            currentDate.getMonth() === selectedDate?.getMonth() &&
                                            currentDate.getFullYear() === selectedDate?.getFullYear() ? colors.background : colors.textPrimary
                                    }}>{item ? item : ''}</Text></View>
                            </TouchableOpacity>
                        )}
                    />
                    <View style={{ flexDirection: "row", justifyContent: "flex-end", paddingRight: responsiveScreenWidth(3), gap: responsiveScreenWidth(3), paddingBottom: responsiveScreenHeight(1) }}>
                        <Text onPress={onCancel} style={{ backgroundColor: colors.primary, paddingVertical: responsiveScreenHeight(1), paddingHorizontal: responsiveScreenWidth(4), fontSize: responsiveScreenFontSize(1.8), color: colors.background, borderRadius: 10 }}>Cancel</Text>
                        <Text onPress={() => {
                            setDate && setDate(`${selectedDate}`)
                            setDate && onCancel()
                        }} style={{ backgroundColor: colors.primary, paddingVertical: responsiveScreenHeight(1), paddingHorizontal: responsiveScreenWidth(4), fontSize: responsiveScreenFontSize(1.8), color: colors.background, borderRadius: 10 }}>Done</Text>
                    </View>
                </View>
            </View>
            {/* <Modal visible={jumpModal} transparent animationType="slide">
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#00000080" }}>
    <View style={{ backgroundColor: colors.background, padding: 20, borderRadius: 10, width: "80%" }}>
      <Text style={{ color: colors.textPrimary, fontSize: 18, marginBottom: 10 }}>Jump to:</Text>
      
      <FlatList
        horizontal
        data={Array.from({ length: 50 }, (_, i) => 1980 + i)} // years from 1980 to 2029
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelectedYear(item)}>
            <Text style={{
              margin: 5,
              fontSize: 16,
              color: item === selectedYear ? colors.primary : colors.textSecondary,
              fontWeight: item === selectedYear ? 'bold' : 'normal'
            }}>{item}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.toString()}
      />

      <FlatList
        horizontal
        data={Array.from({ length: 12 }, (_, i) => i)} // 0 to 11
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelectedMonth(item)}>
            <Text style={{
              margin: 5,
              fontSize: 16,
              color: item === selectedMonth ? colors.primary : colors.textSecondary,
              fontWeight: item === selectedMonth ? 'bold' : 'normal'
            }}>
              {new Date(2000, item, 1).toLocaleString('default', { month: 'short' })}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.toString()}
      />

      <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 20 }}>
        <Text onPress={() => setJumpModal(false)} style={{ marginRight: 20, color: colors.textSecondary }}>Cancel</Text>
        <Text
          onPress={() => {
            setCurrentDate(new Date(selectedYear, selectedMonth, 1));
            setJumpModal(false);
          }}
          style={{ color: colors.primary, fontWeight: "bold" }}
        >
          Go
        </Text>
      </View>
    </View>
  </View>
</Modal> */}
        </Modal>
    );
};
const styles = StyleSheet.create({

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: responsiveScreenHeight(2),
        marginTop: responsiveScreenHeight(1)
    },
    month: {
        fontSize: responsiveScreenFontSize(2.2),
        fontWeight: 'bold',

    },
    nav: {
        fontSize: responsiveScreenFontSize(3),
        paddingHorizontal: responsiveScreenWidth(3),
    },
    weekdays: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayLabel: {
        width: '14.2%',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    day: {
        width: '14.2%',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 4,
    },
    dayText: {
        height: "100%",
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

});
