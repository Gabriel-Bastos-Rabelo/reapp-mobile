import { Ionicons } from '@expo/vector-icons';
import { router, Link } from 'expo-router';
import {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  SectionList,
} from 'react-native';
import { Modalize } from 'react-native-modalize';
import { ExploreScreenCard, CardSearch, LoadingBox } from 'src/components';
import Colors from 'src/constants/colors';
import { useSearch } from 'src/hooks/useSearch';
import { ICategory } from 'src/mocks/app-InstitutionCategory-data';
import {
  getInstituitionCategories,
  getInstitutions,
} from 'src/services/app-core';
import { IInstitution } from 'src/types';

type RenderItemProps = {
  item: IInstitution;
  onOpen: () => void;
  onPressCard: (item: any) => void;
};

type RenderCardSearchProps = {
  item: IInstitution;
  searchPhrase: string;
  onPressCard: (item: any) => void;
};

const Modal = memo(() => {
  return (
    <View className="gap-y-7 px-6 py-8">
      <View className="flex-row gap-x-2">
        <Ionicons name="information-circle-outline" size={24} color="white" />
        <Link href="#" className="font-reapp_medium text-base text-text_light">
          Informações
        </Link>
      </View>

      <TouchableOpacity>
        <View className="flex-row gap-x-2">
          <Ionicons name="add" size={24} color="white" />
          <Text className="font-reapp_medium text-base text-text_light">
            Seguir
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity>
        <View className="flex-row gap-x-2">
          <Ionicons name="heart-outline" size={24} color="white" />
          <Text className="font-reapp_medium text-base text-text_light">
            Favoritar
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity>
        <View className="flex-row gap-x-2">
          <Ionicons name="close" size={24} color="white" />
          <Text className="font-reapp_medium text-base text-text_light">
            Remover dos seguidos
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
});

const RenderItem = memo<RenderItemProps>(({ item, onOpen, onPressCard }) => {
  return (
    <ExploreScreenCard
      title={item.name}
      isInstitution
      imageUrl={item.image}
      onPressInfo={onOpen}
      onPressCard={() => onPressCard(item)}
    />
  );
});

const RenderCardSearch = memo<RenderCardSearchProps>(
  ({ item, searchPhrase, onPressCard }) => {
    if (searchPhrase === '') {
      return (
        <CardSearch
          imageUrl={item.image}
          title={item.name}
          onPress={() => onPressCard(item)}
        />
      );
    }

    if (
      item.name
        .toUpperCase()
        .includes(searchPhrase.toUpperCase().trim().replace(/\s/g, ''))
    ) {
      return (
        <CardSearch
          imageUrl={item.image}
          title={item.name}
          onPress={() => onPressCard(item)}
        />
      );
    }
  }
);

const InstitutionCardPlaceholder = memo(() => (
  <View className="pt-30 flex-1 justify-center px-4">
    {Array.from({ length: 3 }).map((_, index) => (
      <Fragment key={index}>
        <LoadingBox customStyle="h-4 w-32 mb-2 mt-2 rounded-md bg-slate-400 last:mb-0" />
        <ScrollView horizontal>
          {Array.from({ length: 7 }).map((__, index2) => (
            <LoadingBox
              key={index2}
              customStyle="h-48 w-32 mr-2 rounded-md bg-slate-400 last:mb-0"
            />
          ))}
        </ScrollView>
      </Fragment>
    ))}
  </View>
));

const InstitutionsPage = () => {
  const [institutions, setInstitutions] = useState<IInstitution[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);
  const { isSearchActive, searchQuery } = useSearch();

  useEffect(() => {
    (async () => {
      const institutionsData = await getInstitutions();
      setInstitutions(institutionsData);
      const categoriesData = await getInstituitionCategories();
      setCategories(categoriesData);
      setLoadingInstitutions(false);
    })();
  }, []);

  const sections = useMemo(() => {
    return categories.map((category) => {
      return {
        title: category.category,
        data: [
          institutions.filter(
            (institution) => institution.categoryId === category.id
          ),
        ],
      };
    });
  }, [categories, institutions]);

  const modalizeRef = useRef<Modalize>(null);

  const onOpen = useCallback(
    (item) => {
      modalizeRef.current?.open();
    },
    [modalizeRef]
  );

  const handleCardClick = (item) => {
    router.push({ pathname: 'institution', params: { id: item.id } });
  };

  if (loadingInstitutions) {
    return <InstitutionCardPlaceholder />;
  }

  return (
    <>
      {!isSearchActive ? (
        <View className="px-4">
          <SectionList
            sections={sections}
            renderSectionHeader={({ section: { title, data } }) => (
              <Text className="mb-2 font-reapp_medium text-base">
                {title} ({data[0].length})
              </Text>
            )}
            renderItem={({ item }) => (
              <FlatList
                data={item}
                horizontal
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={3}
                getItemLayout={(_, index) => ({
                  length: 128,
                  offset: 140 * index,
                  index,
                })}
                renderItem={({ item }) => (
                  <RenderItem
                    item={item}
                    onOpen={() => onOpen(item)}
                    onPressCard={handleCardClick}
                  />
                )}
                keyExtractor={(item) => item.id.toString()}
                showsHorizontalScrollIndicator={false}
                ItemSeparatorComponent={() => <View className="w-3" />}
                className="mb-2.5"
              />
            )}
          />
        </View>
      ) : (
        <FlatList
          data={institutions}
          renderItem={({ item }) => (
            <RenderCardSearch
              item={item}
              key={item.id}
              searchPhrase={searchQuery}
              onPressCard={handleCardClick}
            />
          )}
        />
      )}

      <Modalize
        ref={modalizeRef}
        adjustToContentHeight
        modalStyle={{ backgroundColor: Colors.text_primary }}
      >
        <Modal />
      </Modalize>
    </>
  );
};

export default memo(InstitutionsPage);