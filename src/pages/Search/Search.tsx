import {
  NavigationProp,
  ParamListBase,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  Animated,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  responsiveScreenFontSize,
  responsiveScreenHeight,
  responsiveScreenWidth,
} from 'react-native-responsive-dimensions';
import { routes } from '../../constants/values';
import { useAppDispatch } from '../../store';
import imagePath from '../../assets/imagePath';
import { NavigationBar } from '../../components';
import { ThemeContext } from '../../context/ThemeProvider';
import { GetFilter, GetJobs } from '../../reducer/jobsReducer';
import Icon from '../../utils/Icon';
import { formatSalaryRange } from '../../utils';
type FilterValue = string | number;
type FilterState = Partial<Record<string, FilterValue[]>>;
const Search = () => {
  const route: any = useRoute();
  const pageVal = route.params?.page;
  const [page, setPage] = useState(pageVal || 0);
  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const { colors } = useContext(ThemeContext)
  const [activeSearch, setActiveSearch] = useState(false)
  const [activeFilter, setActiveFilter] = useState(false)
  const [search, setSearch] = useState('');
  const dispatch = useAppDispatch()
  const [job, setJob] = useState<Job[]>([])
  const [dataFilter, setDataFilter] = useState<{ filter: string, option: string[] | { id: number, name: string }[] }[]>([])
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [temFilter, setTemFilter] = useState<FilterState>({});
  const [filter, setFilter] = useState<FilterState>({});
  const formatCamelCase = (str = '') =>
    str
      .replace(/([a-z])([A-Z])/g, '$1 $2') // add space before capital letters
      .replace(/_/g, ' ')                  // handle snake_case if any
      .toLowerCase();
  const Label = ({ text }: { text: string }) => (
    <View style={{ flexDirection: 'row', width: '100%', marginTop: responsiveScreenHeight(1) }}>
      <Text style={{ textTransform: "capitalize", color: colors.textPrimary, fontSize: responsiveScreenFontSize(1.8) }}>
        {formatCamelCase(text)}
      </Text>
    </View>
  );
  useEffect(() => {
    dispatch(GetJobs({ search: search })).unwrap().then((res) => {
      if (res.success) {
        setJob(res.data.jobs)
      }
    })
  }, [search])
  useEffect(() => {
    dispatch(GetFilter({})).unwrap().then((res) => {
      if (res.success) {
        setDataFilter(res.data.filter)
      }
    })
  }, [job])
  return (
    <NavigationBar name={routes.HOME}>
      <ScrollView style={{}} contentContainerStyle={{ flex: 1, justifyContent: "flex-start" }}>
        <View style={{
          flexDirection: "row", position: "relative", justifyContent: "space-between", alignItems: "center", borderBottomColor: colors.textDisabled, borderBottomWidth: .5, paddingBottom: responsiveScreenHeight(2), width: responsiveScreenWidth(100),
          paddingHorizontal: responsiveScreenWidth(5)
        }}>
          {
            activeFilter ? <TouchableOpacity onPress={() => setActiveFilter(false)}>
              <Image source={imagePath.cross} style={{ resizeMode: "contain", }} />
            </TouchableOpacity> :
              <TouchableOpacity >
                <Image source={imagePath.backIcon} style={{ resizeMode: "contain", }} />
              </TouchableOpacity>
          }
          <Text style={{ flex: 1, textAlign: "center", fontSize: responsiveScreenFontSize(2), color: colors.textPrimary, fontWeight: "600" }}>{activeFilter ? "Filter" : "Search Job"}</Text>
          <Image source={imagePath.backIcon} style={{ opacity: 0, resizeMode: "contain", }} />
        </View>
        {
          activeFilter ?
            <View style={{ justifyContent: "space-between", flex: 1 }}>
              {
                dataFilter.length > 0 &&
                <FlatList
                  keyExtractor={(e) => e.filter}
                  ListFooterComponent={() => {
                    return (<View style={{ gap: responsiveScreenHeight(1), width: "100%", marginBottom: responsiveScreenHeight(2), marginHorizontal: "auto" }}>
                      <View style={{ flexDirection: 'row', gap: responsiveScreenWidth(3) }}>
                        <View style={{ flex: 1 }}>
                          <Label text='Min Salary' />


                          <TextInput
                            value={temFilter.min_salary ?? ''}
                            keyboardType="number-pad"
                            placeholder="0"
                            placeholderTextColor={colors.textDisabled}
                            onChangeText={(t) =>
                              setTemFilter((prev: any) => ({
                                ...prev,
                                min_salary: t.replace(/[^0-9]/g, ''),
                              }))
                            }
                            style={{
                              borderWidth: 1,
                              borderColor: colors.textDisabled,
                              borderRadius: 8,
                              paddingHorizontal: responsiveScreenWidth(3),
                              paddingVertical: responsiveScreenHeight(1.2),
                              color: colors.textSecondary,
                            }}
                          />
                        </View>

                        <View style={{ flex: 1 }}>
                          <Label text='Max Salary' />

                          <TextInput
                            value={temFilter.max_salary ?? ''}
                            keyboardType="number-pad"
                            placeholder="100000"
                            placeholderTextColor={colors.textDisabled}
                            onChangeText={(t) =>
                              setTemFilter((prev: any) => ({
                                ...prev,
                                max_salary: t.replace(/[^0-9]/g, ''),
                              }))
                            }
                            style={{
                              borderWidth: 1,
                              borderColor: colors.textDisabled,
                              borderRadius: 8,
                              paddingHorizontal: responsiveScreenWidth(3),
                              paddingVertical: responsiveScreenHeight(1.2),
                              color: colors.textSecondary,
                            }}
                          />
                        </View>
                      </View>

                      {!!temFilter.min_salary &&
                        !!temFilter.max_salary &&
                        Number(temFilter.min_salary) > Number(temFilter.max_salary) && (
                          <Text style={{ color: colors.red, fontSize: responsiveScreenFontSize(1.6) }}>
                            Min salary cannot be greater than max salary
                          </Text>
                        )}
                    </View>)
                  }}
                  style={{ width: responsiveScreenWidth(90), marginHorizontal: "auto", paddingVertical: responsiveScreenHeight(2) }}
                  contentContainerStyle={{}} scrollEnabled={true} data={dataFilter} renderItem={({ item, index }) => {
                    const isOpen = openIndex === index;

                    return (
                      <React.Fragment>
                        <Label text={item.filter} />
                        <CustomMultiDropdown
                          data={item.option}
                          placeholder="Select Countries"
                          selectedValues={temFilter?.[item.filter] || []}
                          onSelect={(arr) => setTemFilter(prev => ({ ...prev, [item.filter]: arr }))}
                          labelKey="name"
                          valueKey="id"
                        />
                      </React.Fragment>
                    )
                  }} />
              }
              <TouchableOpacity
                onPress={() => {
                  setActiveFilter(false)
                  setFilter(temFilter)
                }}
                style={{
                  width: '90%',
                  justifyContent: 'center',
                  marginHorizontal: "auto",
                  marginTop: responsiveScreenHeight(2),
                  borderRadius: 6,
                  gap: responsiveScreenWidth(1),
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.primary,
                  paddingHorizontal: responsiveScreenWidth(3),
                  paddingVertical: responsiveScreenHeight(1.5),
                }}
              >
                <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.8) }}>
                  Apply Filter
                </Text>
              </TouchableOpacity>

            </View> : <>
              <View style={{ flexDirection: "row", marginTop: responsiveScreenHeight(1), gap: responsiveScreenWidth(2), alignItems: "center", width: responsiveScreenWidth(90), marginHorizontal: "auto" }}>
                <TouchableOpacity
                  style={{
                    borderWidth: 1,
                    flex: 1,
                    borderColor: colors.primary,
                    borderRadius: 7,
                    backgroundColor: colors.lightGrayNatural,
                    gap: responsiveScreenWidth(1),
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: responsiveScreenWidth(2),
                    paddingVertical: responsiveScreenHeight(1.2),
                  }}>
                  <TouchableOpacity onPress={() => setActiveSearch(false)}>
                    <Image style={{}} source={imagePath.search} />
                  </TouchableOpacity>
                  <TextInput
                    value={search}
                    onFocus={() => { setActiveSearch(true) }}
                    onChangeText={e => setSearch(e)}
                    placeholder="Search"
                    placeholderTextColor={colors.textDisabled}
                    style={{
                      flex: 1,
                      margin: 0,
                      padding: 0,
                      fontSize: responsiveScreenFontSize(1.8),
                    }}
                  />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => {
                  setTemFilter(filter)
                  setActiveFilter(true)
                }} style={{ maxHeight: responsiveScreenHeight(6) }} >
                  <Image source={imagePath.filter} style={{ height: "100%", resizeMode: "contain", }} />
                </TouchableOpacity>
              </View>
              {
                activeSearch ? <>
                  <View style={{ width: responsiveScreenWidth(90), marginHorizontal: "auto", flexDirection: "row", marginVertical: responsiveScreenHeight(2), justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ fontSize: responsiveScreenFontSize(2.4), fontWeight: "600", textTransform: "capitalize", }}>Recent Searches</Text>
                  </View>
                  <View style={{ width: responsiveScreenWidth(90), marginHorizontal: "auto", flexDirection: "row", gap: responsiveScreenWidth(2), alignItems: "center", marginTop: responsiveScreenHeight(1) }}>
                    <Image source={imagePath.history} /><Text style={{ color: colors.mediumGrayNatural, fontSize: responsiveScreenFontSize(2), fontWeight: "500" }}>ui ux Disner</Text>
                  </View>
                </> :
                  <>
                    <FlatList scrollEnabled={false} style={{ width: responsiveScreenWidth(94), marginHorizontal: "auto" }} data={job} renderItem={({ item, index }) => {
                      return (
                        <>
                          <TouchableOpacity style={{ paddingVertical: responsiveScreenHeight(1.5), paddingHorizontal: responsiveScreenWidth(3), backgroundColor: colors.white, elevation: 4, margin: 10, borderRadius: 15 }}>
                            <View style={{ flexDirection: "row", gap: responsiveScreenWidth(1), justifyContent: "space-between", alignItems: "center" }}>
                              <View style={{ borderRadius: 6, height: responsiveScreenHeight(6), overflow: "hidden", backgroundColor: "#CECECE38" }}>
                                <Image source={{ uri: item.company_info.image }} style={{ height: "100%", aspectRatio: 1 }} />
                              </View>
                              <TouchableOpacity onPress={() => navigation.navigate(routes.JOBDETAIL, { id: item.id })} style={{ flex: 1 }}>
                                <Text numberOfLines={1} style={{ textTransform: "capitalize", fontSize: responsiveScreenFontSize(1.8), fontWeight: "400" }} >{item.company_info.name}</Text>
                                <Text numberOfLines={1} style={{ fontSize: responsiveScreenFontSize(1.8), fontWeight: "700" }}>{item.title}</Text>
                              </TouchableOpacity>
                              <View >
                                <Image source={imagePath.bookmark} />
                              </View>
                            </View>
                            <View style={{ flexDirection: "row", gap: responsiveScreenWidth(2), flexWrap: "wrap", marginVertical: responsiveScreenHeight(2) }}>
                              {
                                item.jobType && <Text style={{ backgroundColor: "#F5F5F5", textTransform: "capitalize", borderWidth: 1, borderColor: "#F5F5F5", paddingVertical: responsiveScreenHeight(.5), paddingHorizontal: responsiveScreenWidth(2), borderRadius: 5, fontSize: responsiveScreenFontSize(1.8) }}>{item.jobType}</Text>
                              }
                            </View>
                            <View style={{ flexDirection: "row" }}>
                              <View style={{ flexDirection: "row", flex: 1, alignItems: "center" }}>
                                {
                                  item.salary && <>
                                    <Text style={{ fontSize: responsiveScreenFontSize(2.2), fontWeight: "500" }}>{item.salary_currency}{formatSalaryRange(item.salary)} </Text>
                                    <Text style={{ flex: 1, marginTop: responsiveScreenHeight(.3) }}>{item.salary_period}</Text>
                                  </>
                                }
                              </View>

                              <View style={{ borderRadius: 6, gap: responsiveScreenWidth(1), flexDirection: "row", alignItems: "center", backgroundColor: colors.primary, paddingHorizontal: responsiveScreenWidth(3), paddingVertical: responsiveScreenHeight(.7) }}>
                                <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.8) }}>Apply Now</Text>
                                <Icon icon={{ type: "Feather", name: 'arrow-right' }} style={{ color: colors.white, fontSize: responsiveScreenFontSize(2) }} />
                              </View>
                            </View>
                          </TouchableOpacity>
                        </>
                      )
                    }} />
                  </>
              }

            </>
        }


      </ScrollView>
    </NavigationBar>

  );
};
const getOptionValue = (item: any, valueKey = 'id') =>
  typeof item === 'string' ? item : item?.[valueKey];

const getOptionLabel = (item: any, labelKey = 'name') =>
  typeof item === 'string' ? item : item?.[labelKey];

export const CustomMultiDropdown = ({
  data = [],
  placeholder = 'Select',
  selectedValues = [],
  onSelect = (arr: any[]) => { },
  labelKey = 'name',
  valueKey = 'id',
}) => {
  const [visible, setVisible] = useState(false);
  const { colors } = useContext(ThemeContext);
  const selectedLabel = useMemo(() => {
    if (!selectedValues?.length) return '';
    const labels = data
      .filter((x: any) => selectedValues.includes(getOptionValue(x, valueKey)))
      .map((x: any) => getOptionLabel(x, labelKey));

    if (labels.length > 3) return `${labels.length} selected`;
    return labels.join(', ');
  }, [data, selectedValues, labelKey, valueKey]);

  const toggleValue = (val: any) => {
    console.log(val)
    const exists = selectedValues.includes(val);
    const updated = exists
      ? selectedValues.filter(v => v !== val)
      : [...selectedValues, val];
    console.log(updated)
    onSelect(updated);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={{
          borderWidth: 1,
          width: '100%',
          borderRadius: 6,
          borderColor: colors.mediumGray,
          paddingHorizontal: responsiveScreenWidth(3),
          paddingVertical: responsiveScreenHeight(1.3),
          marginTop: responsiveScreenHeight(1),
        }}
      >
        <Text
          style={{
            fontSize: responsiveScreenFontSize(1.8),
            color: selectedLabel ? colors.textPrimary : colors.gray,
          }}
          numberOfLines={1}
        >
          {selectedLabel || placeholder}
        </Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setVisible(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 8,
              padding: 10,
              maxHeight: '60%',
            }}
          >
            <FlatList
              data={data}
              keyExtractor={(item: any, index: number) =>
                String(getOptionValue(item, valueKey) ?? index)
              }
              renderItem={({ item }) => {
                const val = getOptionValue(item, valueKey);
                const label = getOptionLabel(item, labelKey);
                const isSelected = selectedValues.includes(val);

                return (
                  <TouchableOpacity
                    onPress={() => toggleValue(val)}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text style={{ fontSize: responsiveScreenFontSize(1.8) }}>
                      {label}
                    </Text>

                    <View
                      style={{
                        height: 18,
                        width: 18,
                        borderRadius: 4,
                        borderWidth: 2,
                        borderColor: isSelected ? colors.primary : colors.gray,
                        backgroundColor: isSelected ? colors.primary : 'transparent',
                      }}
                    />
                  </TouchableOpacity>
                );
              }}
            />

            <TouchableOpacity
              onPress={() => setVisible(false)}
              style={{
                marginTop: 8,
                alignSelf: 'flex-end',
                paddingVertical: 10,
                paddingHorizontal: 14,
              }}
            >
              <Text style={{ color: colors.primary, fontSize: responsiveScreenFontSize(1.8) }}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default Search;
