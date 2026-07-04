import {
  NavigationProp,
  ParamListBase,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
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
import { useAppDispatch, useAppSelector } from '../../store';
import imagePath from '../../assets/imagePath';
import { NavigationBar } from '../../components';
import { ThemeContext } from '../../context/ThemeProvider';
import { FunctionalAria, GetFilter, GetJobs } from '../../reducer/jobsReducer';
import Icon from '../../utils/Icon';
import { formatSalaryRange } from '../../utils';
import { JobCard } from '../CompanyDetails/CompanyDetails';
import { EmptyComp } from '../../recruiter/pages/OpenJobs/OpenJobs';
import Text from '../../components/Text';
type FilterValue = string | number;
type FilterState = Partial<Record<string, FilterValue[]>>;
const formatCamelCase = (str = '') =>
  str
    .replace(/([a-z])([A-Z])/g, '$1 $2') // add space before capital letters
    .replace(/_/g, ' ')                  // handle snake_case if any
    .toLowerCase();
const Label = ({ text }: { text: string }) => {
  const { colors } = useContext(ThemeContext)

  return (
    <View style={{ flexDirection: 'row', width: '100%', marginTop: responsiveScreenHeight(1) }}>
      <Text style={{ textTransform: "capitalize", color: colors.textPrimary, fontSize: responsiveScreenFontSize(1.8) }}>
        {formatCamelCase(text)}
      </Text>
    </View>
  )
};
const Search = () => {
  const route: any = useRoute();
  const homeSearch = route.params?.searchText;
  const searchPage = route.params?.search;
  const filterPage = route.params?.filter;
  const [loading, setLoading] = useState(true)
  const jobType = route.params?.type;
  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const { colors } = useContext(ThemeContext)
  const [activeSearch, setActiveSearch] = useState(searchPage)
  const [activeFilter, setActiveFilter] = useState(filterPage)
  const [search, setSearch] = useState(homeSearch || '');
  const dispatch = useAppDispatch()
  const [job, setJob] = useState<Job[]>([])
  const [dataFilter, setDataFilter] = useState<{ filter: string, option: string[] | { id: number, name: string }[] }[]>([])
  const [temFilter, setTemFilter] = useState<FilterState>({});
  const [filter, setFilter] = useState<FilterState>({});
  const [functionalAreas, setFunctionalAreas] = useState([]);
  const [pages, setPages] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const [meta, setMeta] = useState({})
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (jobType) {
      setFilter(prev => ({ ...prev, jobTypes: [jobType] }));
    }
    setReady(true);
  }, [jobType]);

  useEffect(() => {
    if (!ready) return;
    const payload = {
      search,
      job_type_id: filter?.jobTypes ?? [],
      job_skill_id: filter?.skills ?? [],
      company_id: filter?.companies ?? [],
      job_title: filter?.titles ?? [],
      job_experience_id: filter?.jobExperiences ?? [],
      degree_level_id: filter?.degreeLevels ?? [],
      job_shift_id: filter?.jobShifts ?? [],
      gender_id: filter?.genders ?? [],
      career_level_id: filter?.careerLevels ?? [],
      functional_area_id: filter?.functionalAreas ?? [],
      city_id: filter?.cities ?? [],
      pages: pages,
    };
    const promise = dispatch(GetJobs(payload));
    promise.unwrap()
      .then((res) => {
        if (!res?.success) return;

        setMeta(res.data.meta);
        console.log(res.data.jobs, "=========================")
        if (res.data.meta.current_page === 1) {
          setJob(res.data.jobs);
        } else {
          setJob(prev => [...prev, ...res.data.jobs]); // ✅ avoid stale "job"
        }
      })
      .finally(() => {
        setLoading(false)
        setLoadingMore(false)
      });

    return () => {
      // ✅ cancels previous request if filter/pages changes quickly
      promise.abort?.();
    };
  }, [ready, search, filter, pages]);

  const onLoadMore = React.useCallback(() => {
    if (!meta?.last_page) return;
    if (meta?.current_page >= meta.last_page) return;
    if (loadingMore) return;
    setLoadingMore(true)
    setPages((p) => p + 1);
  }, [meta?.last_page, meta?.current_page, loadingMore]);
  useEffect(() => {
    dispatch(FunctionalAria())
      .unwrap()
      .then(res => {
        if (res.success) {
          setFunctionalAreas(res.data);
        }
      });
  }, [])
  // const { appliedJobIds } = useAppSelector(state => state.jobsReducer)

  useEffect(() => {
    dispatch(GetFilter({})).unwrap().then((res) => {
      if (res.success) {
        setDataFilter(res.data.filter)
      }
    })
  }, [job])
  return (
    <NavigationBar navigationBar={false} bottomPadding={false} name={routes.HOME}>
      <KeyboardAvoidingView behavior={"padding"} keyboardVerticalOffset={0} style={{ flex: 1 }}>
        <View style={{
          flexDirection: "row", position: "relative", justifyContent: "space-between", alignItems: "center", borderBottomColor: colors.textDisabled, borderBottomWidth: .5, paddingBottom: responsiveScreenHeight(2), width: responsiveScreenWidth(100),
          paddingHorizontal: responsiveScreenWidth(5)
        }}>
          {
            activeFilter ? <TouchableOpacity onPress={() => setActiveFilter(false)}>
              <Image source={imagePath.cross} style={{ resizeMode: "contain", }} />
            </TouchableOpacity> :
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Image source={imagePath.backIcon} style={{ resizeMode: "contain", }} />
              </TouchableOpacity>
          }
          <Text style={{ flex: 1, textAlign: "center", fontSize: responsiveScreenFontSize(2), color: colors.textPrimary, fontWeight: "600" }}>{activeFilter ? "Filter" : "Search Job"}</Text>
          <Image source={imagePath.backIcon} style={{ opacity: 0, resizeMode: "contain", }} />
        </View>
        {
          activeFilter ?
            <View style={{ justifyContent: "space-between", flex: 1, marginBottom: responsiveScreenHeight(3), }}>
              {
                dataFilter.length > 0 &&
                <FlatList
                  keyExtractor={(e) => e.filter}
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode="none"
                  removeClippedSubviews={false}
                  ListFooterComponent={
                    <SalaryFooter temFilter={temFilter} setTemFilter={setTemFilter} colors={colors} />
                  }
                  style={{ width: responsiveScreenWidth(90), marginHorizontal: "auto", paddingTop: responsiveScreenHeight(2), }}
                  contentContainerStyle={{}} scrollEnabled={true} data={dataFilter} renderItem={({ item, index }) => {

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
                  setPages(1)
                  setLoading(true)
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
                  <TouchableOpacity
                    onPress={() => {
                      setActiveSearch(false)
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
                      Search
                    </Text>
                  </TouchableOpacity>
                  <View style={{ width: responsiveScreenWidth(90), marginHorizontal: "auto", flexDirection: "row", marginVertical: responsiveScreenHeight(2), justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ fontSize: responsiveScreenFontSize(2.4), fontWeight: "600", textTransform: "capitalize", }}>Recent Searches</Text>
                  </View>
                  {
                    functionalAreas.filter(e => e.name.toLowerCase().includes(search.toLowerCase())).slice(0, 6).map((e) => {
                      return (
                        <>
                          <Pressable onPress={() => {
                            setSearch(e.name)
                            setActiveSearch(false)
                          }} style={{ width: responsiveScreenWidth(90), marginHorizontal: "auto", flexDirection: "row", gap: responsiveScreenWidth(2), alignItems: "center", marginTop: responsiveScreenHeight(1) }}>
                            <Image source={imagePath.history} /><Text style={{ color: colors.mediumGrayNatural, fontSize: responsiveScreenFontSize(2), fontWeight: "500" }}>{e.name}</Text>
                          </Pressable>
                        </>
                      )
                    })
                  }
                </> : loading ? <><ActivityIndicator style={{ marginTop: responsiveScreenHeight(40) }} size={responsiveScreenFontSize(3)} /></> :
                  <>
                    <FlatList
                      ListEmptyComponent={() => <EmptyComp bottom={() => {
                        return (
                          <>
                            <Pressable
                              onPress={() => {
                                setFilter({})
                                setLoading(true)
                              }}
                              style={{
                                width: '100%',
                                justifyContent: 'center',
                                marginTop: responsiveScreenHeight(2),
                                borderRadius: 6,
                                gap: responsiveScreenWidth(1),
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: colors.primary,
                                paddingHorizontal: responsiveScreenWidth(3),
                                paddingVertical: responsiveScreenHeight(1.5),
                                marginBottom: responsiveScreenHeight(3)
                              }}
                            >
                              <Text style={{ color: colors.white, fontSize: responsiveScreenFontSize(1.8) }}>
                                Clear Filter
                              </Text>
                            </Pressable>
                          </>
                        )
                      }} />}
                      onEndReachedThreshold={0.3}     // ✅ important
                      onEndReached={onLoadMore}       // ✅
                      scrollEventThrottle={16}
                      removeClippedSubviews={false}
                      ListFooterComponent={loadingMore ? <ActivityIndicator size="small" style={{ marginVertical: responsiveScreenHeight(2) }} /> : null}
                      keyExtractor={(i, index) => `${index}fasdfasdfdasfasdfsadfdasfdasfdasfasdfsdfadsffdsafdsfasdfasdfadsferfewrqewserchitem`}
                      style={{ width: responsiveScreenWidth(94), marginHorizontal: "auto" }} data={job} renderItem={({ item, index }) => {
                        return (
                          <JobCard refresh={() => {
                            setLoading(true)
                            dispatch(GetJobs({ search: search })).unwrap().then((res) => {
                              if (res.success) {
                                setJob(res.data.jobs)
                              }
                            })
                          }} margin={responsiveScreenWidth(2)} item={item} />
                        )
                      }} />
                  </>
              }

            </>
        }


        {/* </ScrollView> */}
      </KeyboardAvoidingView>

    </NavigationBar>

  );
};
const getOptionValue = (item: any, valueKey = 'id') =>
  typeof item === 'string' ? item : item?.[valueKey];

const getOptionLabel = (item: any, labelKey = 'name') =>
  typeof item === 'string' ? item : item?.[labelKey];


const SalaryFooter = React.memo(function SalaryFooter({
  temFilter,
  setTemFilter,
  colors,
}: {
  temFilter: { min_salary?: string; max_salary?: string };
  setTemFilter: React.Dispatch<React.SetStateAction<any>>;
  colors: any;
}) {
  return (
    <View style={{ gap: responsiveScreenHeight(1), width: '100%', marginBottom: responsiveScreenHeight(2) }}>
      <View style={{ flexDirection: 'row', gap: responsiveScreenWidth(3) }}>
        {/* Min */}
        <View style={{ flex: 1 }}>
          <Label text="Min Salary" />
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
            style={inputStyle(colors)}
          />
        </View>

        {/* Max */}
        <View style={{ flex: 1 }}>
          <Label text="Max Salary" />
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
            style={inputStyle(colors)}
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
    </View>
  );
});

const inputStyle = (colors: any) => ({
  borderWidth: 1,
  borderColor: colors.textDisabled,
  borderRadius: 8,
  paddingHorizontal: responsiveScreenWidth(3),
  paddingVertical: responsiveScreenHeight(1.2),
  color: colors.textSecondary,
});
export const CustomMultiDropdown = ({
  data = [],
  placeholder = "Select",
  selectedValues = [],
  onSelect = (arr: any[]) => { },
  labelKey = "name",
  valueKey = "id",
}) => {
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState("");
  const { colors } = useContext(ThemeContext);

  const selectedLabel = useMemo(() => {
    if (!selectedValues?.length) return "";
    const labels = data
      .filter((x: any) => selectedValues.includes(getOptionValue(x, valueKey)))
      .map((x: any) => getOptionLabel(x, labelKey));

    if (labels.length > 3) return `${labels.length} selected`;
    return labels.join(", ");
  }, [data, selectedValues, labelKey, valueKey]);

  const filteredData = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;

    return data.filter((item: any) => {
      const label = String(getOptionLabel(item, labelKey) ?? "").toLowerCase();
      return label.includes(q);
    });
  }, [data, query, labelKey]);

  const toggleValue = (val: any) => {
    const exists = selectedValues.includes(val);
    const updated = exists
      ? selectedValues.filter((v) => v !== val)
      : [...selectedValues, val];
    onSelect(updated);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          setQuery("");
          setVisible(true);
        }}
        style={{
          borderWidth: 1,
          width: "100%",
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
        {/* overlay */}
        <Pressable
          onPress={() => setVisible(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.3)",
            justifyContent: "center",
            paddingHorizontal: 20,
          }}
        >
          {/* modal card - stop overlay close */}
          <Pressable
            onPress={() => { }}
            style={{
              backgroundColor: "white",
              borderRadius: 8,
              padding: 10,
              maxHeight: "60%",
            }}
          >
            {/* search input */}
            <View
              style={{
                borderWidth: 1,
                borderColor: colors.mediumGray,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
                marginBottom: 10,
              }}
            >
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search..."
                placeholderTextColor={colors.gray}
                autoCapitalize="none"
                autoCorrect={false}
                style={{
                  fontSize: responsiveScreenFontSize(1.8),
                  color: colors.textPrimary,
                  padding: 0,
                }}
              />
            </View>

            <FlatList
              data={filteredData}
              keyboardShouldPersistTaps="handled"
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
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: responsiveScreenFontSize(1.8),
                        width: responsiveScreenWidth(70),
                        color: colors.textPrimary,
                      }}
                      numberOfLines={1}
                    >
                      {label}
                    </Text>

                    <View
                      style={{
                        height: 18,
                        width: 18,
                        borderRadius: 4,
                        borderWidth: 2,
                        borderColor: isSelected ? colors.primary : colors.gray,
                        backgroundColor: isSelected
                          ? colors.primary
                          : "transparent",
                      }}
                    />
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text
                  style={{
                    paddingVertical: 14,
                    textAlign: "center",
                    color: colors.gray,
                    fontSize: responsiveScreenFontSize(1.7),
                  }}
                >
                  No results
                </Text>
              }
            />

            <TouchableOpacity
              onPress={() => setVisible(false)}
              style={{
                marginTop: 8,
                alignSelf: "flex-end",
                paddingVertical: 10,
                paddingHorizontal: 14,
              }}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontSize: responsiveScreenFontSize(1.8),
                }}
              >
                Done
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

export default Search;
